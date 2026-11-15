import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color, FontFamily, FontSize, TextStyle } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { Placeholder } from '@tiptap/extensions';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Highlighter,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  SquarePlay,
  Strikethrough,
  Underline,
  Undo2,
  Unlink,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { postService } from '../api/postService';
import styles from './RichTextEditor.module.css';

const BLOCK_STYLES = [
  { value: 'paragraph', label: 'Đoạn văn' },
  { value: 'h2', label: 'Tiêu đề lớn' },
  { value: 'h3', label: 'Tiêu đề nhỏ' },
];

const FONT_FAMILIES = [
  { value: '', label: 'Phông mặc định' },
  { value: 'Georgia, "Times New Roman", serif', label: 'Georgia (báo chí)' },
  { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { value: 'Verdana, Geneva, sans-serif', label: 'Verdana' },
  { value: 'Tahoma, Geneva, sans-serif', label: 'Tahoma' },
  { value: '"Courier New", Courier, monospace', label: 'Courier New' },
];

const FONT_SIZES = ['', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];
const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function ToolButton({ label, active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      className={`${styles.tool} ${active ? styles.toolActive : ''}`}
      aria-label={label}
      title={label}
      aria-pressed={active === undefined ? undefined : Boolean(active)}
      disabled={disabled}
      // Giữ vùng chọn trong editor khi bấm nút
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function currentBlock(editor) {
  if (editor.isActive('heading', { level: 2 })) return 'h2';
  if (editor.isActive('heading', { level: 3 })) return 'h3';
  return 'paragraph';
}

/**
 * Trình soạn bài viết kiểu báo: định dạng chữ (đậm, nghiêng, gạch chân, màu, phông, cỡ chữ), tiêu đề,
 * căn lề, danh sách, trích dẫn, link, ảnh (tải lên) và video YouTube. Giá trị là HTML.
 */
export default function RichTextEditor({
  id,
  value,
  onChange,
  editable = true,
  invalid = false,
  describedBy,
}) {
  const imageInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ HTMLAttributes: { loading: 'lazy' } }),
      Youtube.configure({ nocookie: true, width: 640, height: 360 }),
      Placeholder.configure({
        placeholder: 'Bắt đầu viết bài… Dùng thanh công cụ để định dạng, chèn ảnh và video.',
      }),
    ],
    content: value || '',
    editable,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        class: styles.content,
        ...(id ? { id } : {}),
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': 'Nội dung bài viết',
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
        ...(invalid ? { 'aria-invalid': 'true' } : {}),
      },
    },
    onUpdate: ({ editor: current }) => onChange?.(current.isEmpty ? '' : current.getHTML()),
  });

  useEffect(() => {
    if (editor && editor.isEditable !== editable) editor.setEditable(editable);
  }, [editor, editable]);

  if (!editor) return null;

  const chain = () => editor.chain().focus();
  const textStyle = editor.getAttributes('textStyle');

  const setBlock = (block) => {
    if (block === 'paragraph') chain().setParagraph().run();
    else
      chain()
        .toggleHeading({ level: block === 'h2' ? 2 : 3 })
        .run();
  };

  const setLink = () => {
    const previous = editor.getAttributes('link').href || '';
    const url = window.prompt('Nhập đường dẫn (https://...)', previous);
    if (url === null) return;
    if (!url.trim()) {
      chain().extendMarkRange('link').unsetLink().run();
      return;
    }
    chain().extendMarkRange('link').setLink({ href: url.trim(), target: '_blank' }).run();
  };

  const insertYoutube = () => {
    const url = window.prompt('Dán link video YouTube');
    if (!url?.trim()) return;
    const ok = editor.commands.setYoutubeVideo({ src: url.trim() });
    if (!ok) toast.error('Link YouTube không hợp lệ.');
  };

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!ACCEPT.includes(file.type) || file.size > MAX_IMAGE_BYTES) {
      toast.error('Ảnh phải là JPG/PNG/WebP và tối đa 5MB.');
      return;
    }
    setIsUploading(true);
    try {
      const res = await postService.uploadImage(file);
      const alt = window.prompt('Chú thích / mô tả ảnh (không bắt buộc)', '') ?? '';
      chain()
        .setImage({ src: res.data.url, alt: alt.trim() || file.name, title: alt.trim() || undefined })
        .run();
    } catch (error) {
      toast.error(error?.message || 'Không tải được ảnh.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`${styles.editor} ${invalid ? styles.invalid : ''} ${editable ? '' : styles.readOnly}`}>
      {editable && (
        <div className={styles.toolbar} role="toolbar" aria-label="Định dạng nội dung">
          <div className={styles.group}>
            <ToolButton label="Hoàn tác" disabled={!editor.can().undo()} onClick={() => chain().undo().run()}>
              <Undo2 size={16} />
            </ToolButton>
            <ToolButton label="Làm lại" disabled={!editor.can().redo()} onClick={() => chain().redo().run()}>
              <Redo2 size={16} />
            </ToolButton>
          </div>

          <div className={styles.group}>
            <select
              className={styles.select}
              aria-label="Kiểu đoạn"
              value={currentBlock(editor)}
              onChange={(event) => setBlock(event.target.value)}
            >
              {BLOCK_STYLES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className={styles.select}
              aria-label="Phông chữ"
              value={textStyle.fontFamily || ''}
              onChange={(event) =>
                event.target.value
                  ? chain().setFontFamily(event.target.value).run()
                  : chain().unsetFontFamily().run()
              }
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font.label} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
            <select
              className={`${styles.select} ${styles.sizeSelect}`}
              aria-label="Cỡ chữ"
              value={textStyle.fontSize || ''}
              onChange={(event) =>
                event.target.value
                  ? chain().setFontSize(event.target.value).run()
                  : chain().unsetFontSize().run()
              }
            >
              {FONT_SIZES.map((size) => (
                <option key={size || 'default'} value={size}>
                  {size ? size.replace('px', '') : 'Cỡ chữ'}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.group}>
            <ToolButton
              label="In đậm"
              active={editor.isActive('bold')}
              onClick={() => chain().toggleBold().run()}
            >
              <Bold size={16} />
            </ToolButton>
            <ToolButton
              label="In nghiêng"
              active={editor.isActive('italic')}
              onClick={() => chain().toggleItalic().run()}
            >
              <Italic size={16} />
            </ToolButton>
            <ToolButton
              label="Gạch chân"
              active={editor.isActive('underline')}
              onClick={() => chain().toggleUnderline().run()}
            >
              <Underline size={16} />
            </ToolButton>
            <ToolButton
              label="Gạch ngang"
              active={editor.isActive('strike')}
              onClick={() => chain().toggleStrike().run()}
            >
              <Strikethrough size={16} />
            </ToolButton>
            <label className={styles.colorTool} title="Màu chữ">
              <span className={styles.colorLetter} style={{ borderColor: textStyle.color || '#1f2a24' }}>
                A
              </span>
              <input
                type="color"
                aria-label="Màu chữ"
                value={textStyle.color && textStyle.color.startsWith('#') ? textStyle.color : '#1f2a24'}
                onChange={(event) => chain().setColor(event.target.value).run()}
              />
            </label>
            <ToolButton
              label="Tô nền chữ"
              active={editor.isActive('highlight')}
              onClick={() => chain().toggleHighlight({ color: '#fde68a' }).run()}
            >
              <Highlighter size={16} />
            </ToolButton>
          </div>

          <div className={styles.group}>
            {[
              ['left', 'Căn trái', AlignLeft],
              ['center', 'Căn giữa', AlignCenter],
              ['right', 'Căn phải', AlignRight],
              ['justify', 'Căn đều hai bên', AlignJustify],
            ].map(([align, label, Icon]) => (
              <ToolButton
                key={align}
                label={label}
                active={editor.isActive({ textAlign: align })}
                onClick={() => chain().setTextAlign(align).run()}
              >
                <Icon size={16} />
              </ToolButton>
            ))}
          </div>

          <div className={styles.group}>
            <ToolButton
              label="Danh sách chấm"
              active={editor.isActive('bulletList')}
              onClick={() => chain().toggleBulletList().run()}
            >
              <List size={16} />
            </ToolButton>
            <ToolButton
              label="Danh sách số"
              active={editor.isActive('orderedList')}
              onClick={() => chain().toggleOrderedList().run()}
            >
              <ListOrdered size={16} />
            </ToolButton>
            <ToolButton
              label="Trích dẫn"
              active={editor.isActive('blockquote')}
              onClick={() => chain().toggleBlockquote().run()}
            >
              <Quote size={16} />
            </ToolButton>
            <ToolButton label="Đường kẻ ngang" onClick={() => chain().setHorizontalRule().run()}>
              <Minus size={16} />
            </ToolButton>
          </div>

          <div className={styles.group}>
            <ToolButton label="Chèn / sửa link" active={editor.isActive('link')} onClick={setLink}>
              <Link2 size={16} />
            </ToolButton>
            {editor.isActive('link') && (
              <ToolButton label="Bỏ link" onClick={() => chain().unsetLink().run()}>
                <Unlink size={16} />
              </ToolButton>
            )}
            <ToolButton
              label={isUploading ? 'Đang tải ảnh…' : 'Chèn ảnh'}
              disabled={isUploading}
              onClick={() => imageInputRef.current?.click()}
            >
              <ImagePlus size={16} />
            </ToolButton>
            <ToolButton label="Chèn video YouTube" onClick={insertYoutube}>
              <SquarePlay size={16} />
            </ToolButton>
            <ToolButton
              label="Xoá định dạng"
              onClick={() => chain().unsetAllMarks().clearNodes().unsetTextAlign().run()}
            >
              <RemoveFormatting size={16} />
            </ToolButton>
          </div>

          <input
            ref={imageInputRef}
            type="file"
            accept={ACCEPT.join(',')}
            hidden
            aria-label="Chọn ảnh chèn vào bài"
            onChange={uploadImage}
          />
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
