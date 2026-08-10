import React, { useState } from 'react';
import { X } from 'lucide-react';
import { User } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import api from '../../services/api';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (user: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onUpdate }) => {
  const [bio, setBio] = useState(user.bio || '');
  const [skills, setSkills] = useState<string[]>(user.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddSkill = () => {
    const skill = skillInput.trim();
    if (skill && !skills.includes(skill) && skills.length < 15) {
      setSkills([...skills, skill]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await api.put('/users/profile', { bio, skills });
      onUpdate(response.data.user);
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" maxWidth="max-w-lg">
      <div className="space-y-5">
        {/* Bio */}
        <div>
          <label className="text-sm font-medium text-surface-300 mb-2 block">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the community about yourself..."
            className="textarea-field min-h-[100px]"
            maxLength={500}
            id="edit-bio"
          />
          <p className="text-xs text-surface-500 mt-1">{bio.length}/500</p>
        </div>

        {/* Skills */}
        <div>
          <label className="text-sm font-medium text-surface-300 mb-2 block">
            Skills & Technologies
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {skills.map((skill) => (
              <span key={skill} className="tag-chip flex items-center gap-1">
                {skill}
                <button onClick={() => handleRemoveSkill(skill)} className="hover:text-red-400">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              placeholder="Add a skill (e.g., React, Python)"
              className="input-field text-sm flex-1"
              id="edit-skills-input"
            />
            <Button variant="ghost" size="sm" onClick={handleAddSkill}>
              Add
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditProfileModal;
