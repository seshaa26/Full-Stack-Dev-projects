import React, { useState, useRef } from 'react';
import { X, Plus, Trash2, Image, Hash, BarChart3, Megaphone, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { getPresignedUrl, uploadFileToS3 } from '../../services/uploadService';

type PostMode = 'discussion' | 'poll' | 'announcement';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    content: string;
    type: string;
    mediaUrl?: string;
    tags: string[];
    options?: string[];
  }) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<PostMode>('discussion');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [uploading, setUploading] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const { uploadUrl, fileUrl } = await getPresignedUrl(file.name, file.type);
      await uploadFileToS3(uploadUrl, file);
      setMediaUrl(fileUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setLoading(true);
    try {
      const data: any = {
        content: content.trim(),
        type: mode,
        tags,
        mediaUrl: mediaUrl || undefined,
      };

      if (mode === 'poll') {
        data.options = pollOptions.filter((o) => o.trim());
      }

      await onSubmit(data);

      // Reset form
      setContent('');
      setTags([]);
      setTagInput('');
      setPollOptions(['', '']);
      setMediaUrl('');
      setMode('discussion');
      onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setLoading(false);
    }
  };

  const modes = [
    { key: 'discussion' as PostMode, icon: MessageSquare, label: 'Discussion' },
    { key: 'poll' as PostMode, icon: BarChart3, label: 'Poll' },
    { key: 'announcement' as PostMode, icon: Megaphone, label: 'Announce' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl glass-card p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-surface-100">Create Post</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-surface-400 hover:text-surface-100 hover:bg-surface-700/50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 mb-5 p-1 rounded-xl bg-surface-800/80">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${mode === m.key
                  ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white shadow-neon'
                  : 'text-surface-400 hover:text-surface-200'
                }`}
            >
              <m.icon size={16} />
              {m.label}
            </button>
          ))}
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar src={user?.avatar} name={user?.name} size="md" />
          <div>
            <p className="text-sm font-semibold text-surface-100">{user?.name}</p>
            <p className="text-xs text-surface-500">Posting to community</p>
          </div>
        </div>

        {/* Content Input */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            mode === 'poll'
              ? 'Ask your poll question...'
              : mode === 'announcement'
                ? 'Write your announcement...'
                : 'Share something with the community...'
          }
          className="textarea-field min-h-[120px] mb-4"
          id="create-post-content"
        />

        {/* Poll Options */}
        {mode === 'poll' && (
          <div className="space-y-2 mb-4">
            <label className="text-sm font-medium text-surface-300">Poll Options</label>
            {pollOptions.map((option, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handlePollOptionChange(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="input-field text-sm"
                  id={`poll-option-input-${i}`}
                />
                {pollOptions.length > 2 && (
                  <button
                    onClick={() => handleRemovePollOption(i)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            {pollOptions.length < 6 && (
              <button
                onClick={handleAddPollOption}
                className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                <Plus size={16} /> Add Option
              </button>
            )}
          </div>
        )}

        {/* Image Upload */}
        {mode !== 'poll' && (
          <div className="mb-4">
            {mediaUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-surface-700/30">
                <img src={mediaUrl} alt="Upload preview" className="w-full max-h-48 object-cover" />
                <button
                  onClick={() => setMediaUrl('')}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-surface-600/50 
                         text-sm text-surface-400 hover:text-surface-200 hover:border-primary-500/30 transition-colors"
              >
                <Image size={16} />
                {uploading ? 'Uploading...' : 'Add Image'}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        )}

        {/* Tags */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Hash size={14} className="text-surface-500" />
            <span className="text-sm font-medium text-surface-300">Tags</span>
            <span className="text-xs text-surface-500">({tags.length}/5)</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((tag) => (
              <span key={tag} className="tag-chip flex items-center gap-1">
                #{tag}
                <button onClick={() => handleRemoveTag(tag)} className="ml-0.5 hover:text-red-400">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Add a tag..."
              className="input-field text-sm flex-1"
              id="tag-input"
            />
            <Button variant="ghost" size="sm" onClick={handleAddTag}>
              Add
            </Button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={!content.trim() || (mode === 'poll' && pollOptions.filter((o) => o.trim()).length < 2)}
          >
            {mode === 'poll' ? 'Create Poll' : mode === 'announcement' ? 'Post Announcement' : 'Post'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
