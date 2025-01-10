import { CodeBlock } from '@repo/design-system/components/code-block';

const embedCode = `<script>
  (function() {
    window.EververseWidgetId = 'YOUR_WIDGET_ID';
    window.EververseWidgetDarkMode = true;
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = 'widget.js';
    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
  })();
</script>`;

export const WidgetGraphic = () => (
  <CodeBlock language="html" code={embedCode} />
);
