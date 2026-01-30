'use client'

import { useState, useCallback } from 'react'

interface TiptapEditorProps {
  onChange?: (json: string, plainText: string) => void
  initialContent?: string
  placeholder?: string
}

/**
 * Rich Text Editor Component
 *
 * A simple rich text editor for creating articles.
 * Uses a textarea as a foundation - can be enhanced with Tiptap later.
 */
export function TiptapEditor({
  onChange,
  initialContent = '',
  placeholder = 'Start writing your article...'
}: TiptapEditorProps) {
  const [content, setContent] = useState(initialContent)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)

    // For now, pass the same content as both JSON and plain text
    // In a full implementation, JSON would contain formatting metadata
    onChange?.(JSON.stringify({ content: newContent }), newContent)
  }, [onChange])

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex gap-2">
        <button
          type="button"
          className="px-3 py-1 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded"
          title="Bold (formatting coming soon)"
        >
          B
        </button>
        <button
          type="button"
          className="px-3 py-1 text-sm italic text-gray-600 hover:bg-gray-200 rounded"
          title="Italic (formatting coming soon)"
        >
          I
        </button>
        <button
          type="button"
          className="px-3 py-1 text-sm underline text-gray-600 hover:bg-gray-200 rounded"
          title="Underline (formatting coming soon)"
        >
          U
        </button>
        <div className="w-px bg-gray-300 mx-2" />
        <button
          type="button"
          className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded"
          title="Heading (formatting coming soon)"
        >
          H1
        </button>
        <button
          type="button"
          className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded"
          title="Heading 2 (formatting coming soon)"
        >
          H2
        </button>
        <div className="w-px bg-gray-300 mx-2" />
        <button
          type="button"
          className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded"
          title="Bullet list (formatting coming soon)"
        >
          • List
        </button>
        <button
          type="button"
          className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded"
          title="Numbered list (formatting coming soon)"
        >
          1. List
        </button>
      </div>

      {/* Editor Area */}
      <textarea
        value={content}
        onChange={handleChange}
        placeholder={placeholder}
        rows={20}
        className="w-full p-4 focus:outline-none resize-none min-h-[400px] text-gray-900 leading-relaxed"
      />

      {/* Status Bar */}
      <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 text-xs text-gray-500 flex justify-between">
        <span>Rich formatting coming soon - plain text mode active</span>
        <span>{content.length} characters</span>
      </div>
    </div>
  )
}

export default TiptapEditor
