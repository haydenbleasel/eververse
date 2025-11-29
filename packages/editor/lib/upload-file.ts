import { createClient } from "@repo/backend/auth/client";
import { toast } from "@repo/design-system/lib/toast";
import type { EditorState } from "@tiptap/pm/state";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { nanoid } from "nanoid";

const uploadKey = new PluginKey("upload-image");

export const uploadImagesPlugin = (): Plugin =>
  new Plugin({
    key: uploadKey,
    state: {
      init() {
        return DecorationSet.empty;
      },
      apply(tr, set) {
        set = set.map(tr.mapping, tr.doc);
        // See if the transaction adds or removes any placeholders
        const action = tr.getMeta(this as never);

        if (action?.add) {
          const { id, pos, src } = action.add;

          const placeholder = document.createElement("div");
          placeholder.setAttribute("class", "img-placeholder");

          if (typeof src === "string" && src.startsWith("data:image/")) {
            const image = document.createElement("img");
            image.setAttribute("class", "opacity-40 rounded-lg border");
            image.src = src;
            placeholder.append(image);
          }

          const deco = Decoration.widget(pos + 1, placeholder, {
            id,
          });
          set = set.add(tr.doc, [deco]);
        } else if (action?.remove) {
          set = set.remove(
            set.find(
              undefined,
              undefined,
              (spec) => spec.id === action.remove.id
            )
          );
        }
        return set;
      },
    },
    props: {
      decorations(state) {
        return this.getState(state);
      },
    },
  });

const findPlaceholder = (state: EditorState, id: {}) => {
  const decos = uploadKey.getState(state);

  if (!decos) {
    return null;
  }

  const found = decos.find(
    null,
    null,
    (spec: { id: string }) => spec.id === id
  );

  return found.length > 0 ? found[0].from : null;
};

export const startImageUpload = async (
  file: File,
  view: EditorView,
  pos: number
): Promise<void> => {
  // check if the file is an image
  const isImage = file.type.startsWith("image/");

  if (file.size / 1024 / 1024 > 20) {
    toast.error("File size too big (max 20MB).");
    return;
  }

  // A fresh object to act as the ID for this upload
  const id = {};

  // Replace the selection with a placeholder
  const { tr } = view.state;

  if (!tr.selection.empty) {
    tr.deleteSelection();
  }

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.addEventListener("load", () => {
    tr.setMeta(uploadKey, {
      add: {
        id,
        pos,
        src: reader.result,
      },
    });
    view.dispatch(tr);
  });

  const supabase = await createClient();
  const filename = nanoid(36);

  const { error } = await supabase.storage.from("files").upload(filename, file);

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("files").getPublicUrl(filename);

  if (file.type.startsWith("image/")) {
    const image = new Image();
    image.src = publicUrl;

    await new Promise((resolve, reject) => {
      image.addEventListener("load", () => resolve(publicUrl));
      image.onerror = (error) => {
        const message =
          typeof error === "string"
            ? error
            : "Error uploading image. Please try again.";

        reject(new Error(message));
      };
    });
  }

  const { schema } = view.state;

  const newPos = findPlaceholder(view.state, id);
  /*
   * If the content around the placeholder has been deleted, drop
   * the image
   */
  if (newPos === null) {
    return;
  }

  /*
   * Otherwise, insert it at the placeholder's position, and remove
   * the placeholder
   */

  const node = isImage
    ? schema.nodes.image.create({ src: publicUrl })
    : schema.nodes.file.createAndFill(
        {
          href: publicUrl,
          fileName: file.name,
        },
        schema.text(file.name)
      );

  if (!node) {
    return;
  }

  const transaction = view.state.tr
    .replaceWith(newPos, newPos, node)
    .setMeta(uploadKey, { remove: { id } });
  view.dispatch(transaction);
};
