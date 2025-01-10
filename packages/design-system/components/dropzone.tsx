import { formatBytes } from '@repo/lib/format';
import { parseError } from '@repo/lib/parse-error';
import mime from 'mime/lite';
import { useRef, useState } from 'react';
import type { ChangeEventHandler, DragEventHandler } from 'react';
import { cn } from '../lib/utils';
import { Card, CardContent } from './ui/card';

type DropzoneProperties = {
  readonly accept: string;
  readonly className?: string;
} & (
  | {
      multiple?: false;
      onChange: (file: File) => void;
    }
  | {
      multiple: true;
      onChange: (files: File[]) => void;
    }
);

// Create the Dropzone component receiving props
export const Dropzone = ({
  onChange,
  accept,
  className,
  multiple,
  ...properties
}: DropzoneProperties) => {
  // Initialize state variables using the useState hook
  const fileInputReference = useRef<HTMLInputElement | null>(null);
  const [fileInfo, setFileInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState<boolean>(false);
  const acceptRegex = new RegExp(accept, 'u');

  // Function to handle drag over event
  const handleDragOver: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave: DragEventHandler<HTMLDivElement> = () => {
    setDragging(false);
  };

  // Function to handle processing of uploaded files
  const handleFiles = (files: FileList) => {
    if (files.length === 0) {
      return;
    }

    if (!multiple && files.length > 1) {
      setError('Only one file is allowed');
      return;
    }

    try {
      for (const file of files) {
        const fileExtension = file.name.split('.').pop();

        if (!fileExtension) {
          throw new Error('File extension is not valid');
        }

        const fileType = mime.getType(fileExtension);

        if (!fileType) {
          throw new Error('File type is not valid');
        }

        if (!acceptRegex.test(fileType)) {
          throw new Error(`File type ${fileExtension} is not supported`);
        }
      }

      if (multiple) {
        const filesArray = Array.from(files);
        const totalSize = filesArray.reduce((acc, file) => acc + file.size, 0);
        setFileInfo(`${filesArray.length} files. ${formatBytes(totalSize)}`);
        onChange(filesArray);
      } else {
        const [file] = files;

        setFileInfo(`${file.name} (${formatBytes(file.size)})`);
        onChange(file);
      }

      setError(null);
    } catch (handleError) {
      const message = parseError(handleError);

      setError(message);
    }
  };

  // Function to handle drop event
  const handleDrop: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleFiles(event.dataTransfer.files);
    setDragging(false);
  };

  // Function to handle file input change event
  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const { files } = event.target;
    if (files) {
      handleFiles(files);
    }
  };

  // Function to simulate a click on the file input element
  const handleButtonClick = () => {
    if (fileInputReference.current) {
      fileInputReference.current.click();
    }
  };

  return (
    <Card
      className={cn(
        'cursor-pointer border-dashed bg-background bg-center shadow-none transition-colors',
        dragging ? 'border-primary' : 'border-border',
        className
      )}
      style={{
        backgroundSize: '3rem 3rem',
        backgroundOrigin: 'content-box',
        backgroundImage: `
          linear-gradient(to right, hsl(var(--border) / 0.2) 1px, transparent 1px),
          linear-gradient(to bottom, hsl(var(--border) / 0.2) 1px, transparent 1px)
          `,
      }}
      {...properties}
    >
      <CardContent
        className="flex aspect-[2/1] flex-col items-center justify-center space-y-2 px-2 py-4 text-sm"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleButtonClick}
        onDragLeave={handleDragLeave}
      >
        <div className="flex items-center justify-center text-muted-foreground">
          <span className="font-medium">Click or drag and drop to upload</span>
          <input
            ref={fileInputReference}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            className="hidden"
            multiple={multiple}
            aria-label="Upload File"
          />
        </div>
        {!fileInfo && !error && (
          <p className="text-muted-foreground">{accept} files only.</p>
        )}
        {fileInfo ? <p className="text-muted-foreground">{fileInfo}</p> : null}
        {error ? <span className="text-red-500">{error}</span> : null}
      </CardContent>
    </Card>
  );
};
