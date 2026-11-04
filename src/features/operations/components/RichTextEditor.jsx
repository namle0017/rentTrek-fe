import { useRef } from 'react';
import styles from './Operations.module.css';

const documentShell = '<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src https: data:"><style>body{font:15px/1.8 system-ui;color:#151a24;padding:16px;margin:0;overflow-wrap:anywhere}body:focus{outline:none}img{max-width:100%}</style></head><body></body></html>';

export default function RichTextEditor({ value, onChange }) {
  const frameRef = useRef(null);
  const initialValue = useRef(value);
  const handleFormat = (command, argument) => {
    const document = frameRef.current?.contentDocument;
    document?.body.focus();
    document?.execCommand(command, false, argument);
    if (document) onChange(document.body.innerHTML);
  };
  return <div className={styles.stack}>
    <div className={styles.toolbar} aria-label="Định dạng văn bản">{[['bold', 'Đậm'], ['italic', 'Nghiêng'], ['insertUnorderedList', 'Danh sách'], ['formatBlock', 'Tiêu đề', 'h2'], ['formatBlock', 'Đoạn văn', 'p'], ['removeFormat', 'Bỏ định dạng']].map(([command, label, argument]) => <button className={styles.secondary} type="button" key={label} onMouseDown={(event) => event.preventDefault()} onClick={() => handleFormat(command, argument)}>{label}</button>)}</div>
    <iframe className={styles.preview} title="Nội dung bài viết" ref={frameRef} sandbox="allow-same-origin" srcDoc={documentShell} onLoad={() => {
      const document = frameRef.current.contentDocument;
      document.body.innerHTML = initialValue.current ?? '';
      document.body.contentEditable = 'true';
      document.body.setAttribute('role', 'textbox');
      document.body.setAttribute('aria-label', 'Nội dung bài viết');
      document.body.addEventListener('input', () => onChange(document.body.innerHTML));
    }} />
  </div>;
}
