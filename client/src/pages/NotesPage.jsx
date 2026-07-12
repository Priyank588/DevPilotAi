import { useState, useEffect, useContext } from 'react'
import {
  HiOutlineDocumentText,
  HiOutlinePlusCircle,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineBookmark,
  HiOutlineAcademicCap,
  HiOutlineClipboardDocumentList,
  HiOutlineCheckCircle,
  HiOutlineMapPin,
  HiOutlineXMark,
  HiOutlineCheck,
  HiOutlineLink,
  HiOutlineTag,
  HiOutlineSquares2X2
} from 'react-icons/hi2'
import { NotificationContext } from '../context/NotificationContext'
import noteService from '../services/noteService'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import Skeleton from '../components/common/Skeleton'
import EmptyState from '../components/common/EmptyState'
import Modal from '../components/common/Modal'
import SearchBar from '../components/common/SearchBar'
import ConfirmDialog from '../components/common/ConfirmDialog'

const FILTER_TABS = [
  { key: 'all', label: 'All', icon: HiOutlineSquares2X2 },
  { key: 'note', label: 'Notes', icon: HiOutlineDocumentText },
  { key: 'todo', label: 'Todos', icon: HiOutlineClipboardDocumentList },
  { key: 'bookmark', label: 'Bookmarks', icon: HiOutlineBookmark },
  { key: 'learning', label: 'Learning', icon: HiOutlineAcademicCap }
]

const TYPE_BADGE_MAP = {
  note: { variant: 'primary', label: 'Note' },
  todo: { variant: 'warning', label: 'Todo' },
  bookmark: { variant: 'info', label: 'Bookmark' },
  learning: { variant: 'success', label: 'Learning' }
}

export default function NotesPage() {
  const { showToast } = useContext(NotificationContext)

  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formType, setFormType] = useState('note')
  const [formContent, setFormContent] = useState('')
  const [formTodoItems, setFormTodoItems] = useState([{ text: '', completed: false }])
  const [formBookmarkUrl, setFormBookmarkUrl] = useState('')
  const [formTags, setFormTags] = useState([])
  const [formTagInput, setFormTagInput] = useState('')
  const [formPinned, setFormPinned] = useState(false)
  const [saving, setSaving] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const res = await noteService.getNotes()
      setNotes(res.data.data || res.data || [])
    } catch (err) {
      showToast('Failed to load notes', 'error')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingNote(null)
    setFormTitle('')
    setFormType('note')
    setFormContent('')
    setFormTodoItems([{ text: '', completed: false }])
    setFormBookmarkUrl('')
    setFormTags([])
    setFormTagInput('')
    setFormPinned(false)
    setModalOpen(true)
  }

  const openEditModal = (note) => {
    setEditingNote(note)
    setFormTitle(note.title || '')
    setFormType(note.type || 'note')
    setFormContent(note.content || '')
    setFormTodoItems(note.todoItems?.length ? note.todoItems.map(t => ({ text: t.text || t, completed: !!t.completed })) : [{ text: '', completed: false }])
    setFormBookmarkUrl(note.bookmarkUrl || note.url || '')
    setFormTags(note.tags || [])
    setFormTagInput('')
    setFormPinned(!!note.pinned)
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!formTitle.trim()) {
      showToast('Please enter a title', 'warning')
      return
    }
    const payload = {
      title: formTitle.trim(),
      type: formType,
      pinned: formPinned,
      tags: formTags
    }

    if (formType === 'note' || formType === 'learning') {
      payload.content = formContent
    } else if (formType === 'todo') {
      payload.todoItems = formTodoItems.filter(t => t.text.trim())
    } else if (formType === 'bookmark') {
      payload.bookmarkUrl = formBookmarkUrl
      payload.content = formContent
    }

    try {
      setSaving(true)
      if (editingNote) {
        const res = await noteService.updateNote(editingNote._id, payload)
        const updated = res.data.data || res.data
        setNotes(prev => prev.map(n => n._id === editingNote._id ? updated : n))
        showToast('Note updated successfully', 'success')
      } else {
        const res = await noteService.createNote(payload)
        const created = res.data.data || res.data
        setNotes(prev => [created, ...prev])
        showToast('Note created successfully', 'success')
      }
      setModalOpen(false)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save note', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await noteService.deleteNote(deleteTarget)
      setNotes(prev => prev.filter(n => n._id !== deleteTarget))
      showToast('Note deleted', 'success')
    } catch (err) {
      showToast('Failed to delete note', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleTogglePin = async (note) => {
    try {
      const res = await noteService.updateNote(note._id, { pinned: !note.pinned })
      const updated = res.data.data || res.data
      setNotes(prev => prev.map(n => n._id === note._id ? updated : n))
    } catch (err) {
      showToast('Failed to update note', 'error')
    }
  }

  const handleToggleTodo = async (note, todoIndex) => {
    const updatedItems = note.todoItems.map((item, i) =>
      i === todoIndex ? { ...item, completed: !item.completed } : item
    )
    try {
      const res = await noteService.updateNote(note._id, { todoItems: updatedItems })
      const updated = res.data.data || res.data
      setNotes(prev => prev.map(n => n._id === note._id ? updated : n))
    } catch (err) {
      showToast('Failed to update todo', 'error')
    }
  }

  const addTag = () => {
    const tag = formTagInput.trim()
    if (tag && !formTags.includes(tag)) {
      setFormTags(prev => [...prev, tag])
    }
    setFormTagInput('')
  }

  const removeTag = (tag) => {
    setFormTags(prev => prev.filter(t => t !== tag))
  }

  const addTodoItem = () => {
    setFormTodoItems(prev => [...prev, { text: '', completed: false }])
  }

  const removeTodoItem = (idx) => {
    setFormTodoItems(prev => prev.filter((_, i) => i !== idx))
  }

  const updateTodoItem = (idx, text) => {
    setFormTodoItems(prev => prev.map((item, i) => i === idx ? { ...item, text } : item))
  }

  // Filter and search
  const filteredNotes = notes
    .filter(n => activeFilter === 'all' || n.type === activeFilter)
    .filter(n => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        n.title?.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q) ||
        n.tags?.some(t => t.toLowerCase().includes(q))
      )
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <HiOutlineDocumentText className="w-5 h-5 text-white" />
            </div>
            Notes
          </h1>
          <p className="text-slate-400 mt-2">Organize your thoughts, todos, and bookmarks</p>
        </div>
        <Button variant="primary" icon={HiOutlinePlusCircle} onClick={openCreateModal}>
          Create Note
        </Button>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-wrap gap-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-1.5">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeFilter === tab.key
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search notes..."
          />
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton variant="card" count={6} />
        </div>
      ) : filteredNotes.length === 0 ? (
        <EmptyState
          icon={HiOutlineDocumentText}
          title="No notes found"
          description={searchQuery ? 'Try adjusting your search or filter.' : 'Create your first note to get started!'}
          actionLabel={!searchQuery ? 'Create Note' : undefined}
          onAction={!searchQuery ? openCreateModal : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note, idx) => (
            <Card
              key={note._id}
              className="group animate-slide-up flex flex-col"
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {note.pinned && (
                    <HiOutlineMapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  )}
                  <h3 className="text-white font-medium truncate">{note.title}</h3>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => handleTogglePin(note)}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      note.pinned ? 'text-amber-400 hover:bg-amber-500/10' : 'text-slate-500 hover:text-amber-400 hover:bg-slate-700/50'
                    }`}
                    title={note.pinned ? 'Unpin' : 'Pin'}
                  >
                    <HiOutlineMapPin className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(note)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-slate-700/50 transition-all cursor-pointer"
                  >
                    <HiOutlinePencilSquare className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(note._id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <Badge variant={TYPE_BADGE_MAP[note.type]?.variant || 'primary'} size="sm">
                  {TYPE_BADGE_MAP[note.type]?.label || note.type}
                </Badge>
              </div>

              {/* Content preview */}
              {note.type === 'todo' && note.todoItems?.length > 0 ? (
                <div className="space-y-1.5 flex-1">
                  {note.todoItems.slice(0, 4).map((item, i) => (
                    <label key={i} className="flex items-center gap-2 text-sm cursor-pointer group/todo">
                      <button
                        onClick={() => handleToggleTodo(note, i)}
                        className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                          item.completed
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-slate-600 hover:border-indigo-500'
                        }`}
                      >
                        {item.completed && <HiOutlineCheck className="w-3 h-3 text-white" />}
                      </button>
                      <span className={`${item.completed ? 'line-through text-slate-500' : 'text-slate-300'} truncate`}>
                        {item.text || item}
                      </span>
                    </label>
                  ))}
                  {note.todoItems.length > 4 && (
                    <p className="text-xs text-slate-500">+{note.todoItems.length - 4} more items</p>
                  )}
                </div>
              ) : note.type === 'bookmark' ? (
                <div className="flex-1">
                  {(note.bookmarkUrl || note.url) && (
                    <a
                      href={note.bookmarkUrl || note.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors truncate mb-2"
                    >
                      <HiOutlineLink className="w-4 h-4 flex-shrink-0" />
                      {note.bookmarkUrl || note.url}
                    </a>
                  )}
                  {note.content && (
                    <p className="text-sm text-slate-400 line-clamp-2">{note.content}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400 line-clamp-3 flex-1">{note.content || 'No content'}</p>
              )}

              {/* Tags */}
              {note.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-700/30">
                  {note.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-700/50 text-slate-400">
                      <HiOutlineTag className="w-2.5 h-2.5 inline mr-0.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Date */}
              <p className="text-xs text-slate-500 mt-3">
                {note.createdAt ? new Date(note.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                }) : ''}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingNote ? 'Edit Note' : 'Create Note'}
        size="lg"
      >
        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
            />
          </div>

          {/* Type selector */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Type</label>
            <div className="flex gap-2">
              {['note', 'todo', 'bookmark', 'learning'].map(type => (
                <button
                  key={type}
                  onClick={() => setFormType(type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border ${
                    formType === type
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                      : 'border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {type === 'note' && <HiOutlineDocumentText className="w-4 h-4" />}
                  {type === 'todo' && <HiOutlineClipboardDocumentList className="w-4 h-4" />}
                  {type === 'bookmark' && <HiOutlineBookmark className="w-4 h-4" />}
                  {type === 'learning' && <HiOutlineAcademicCap className="w-4 h-4" />}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Content for note/learning */}
          {(formType === 'note' || formType === 'learning') && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Content</label>
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Write your note..."
                rows={5}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 resize-none"
              />
            </div>
          )}

          {/* Todo items */}
          {formType === 'todo' && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Todo Items</label>
              <div className="space-y-2">
                {formTodoItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updateTodoItem(idx, e.target.value)}
                      placeholder={`Item ${idx + 1}...`}
                      className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                    />
                    {formTodoItems.length > 1 && (
                      <button
                        onClick={() => removeTodoItem(idx)}
                        className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                      >
                        <HiOutlineXMark className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addTodoItem}
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <HiOutlinePlusCircle className="w-4 h-4" />
                  Add item
                </button>
              </div>
            </div>
          )}

          {/* Bookmark URL */}
          {formType === 'bookmark' && (
            <>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">URL</label>
                <input
                  type="url"
                  value={formBookmarkUrl}
                  onChange={(e) => setFormBookmarkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Description (optional)</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Add a description..."
                  rows={3}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 resize-none"
                />
              </div>
            </>
          )}

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formTags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-rose-400 transition-colors cursor-pointer">
                    <HiOutlineXMark className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={formTagInput}
              onChange={(e) => setFormTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              placeholder="Type tag and press Enter..."
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
            />
          </div>

          {/* Pin */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setFormPinned(prev => !prev)}
              className={`w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                formPinned
                  ? 'bg-indigo-500 border-indigo-500'
                  : 'border-slate-600 hover:border-indigo-500'
              }`}
            >
              {formPinned && <HiOutlineCheck className="w-3.5 h-3.5 text-white" />}
            </div>
            <span className="text-sm text-slate-300">Pin this note</span>
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              {editingNote ? 'Update Note' : 'Create Note'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  )
}
