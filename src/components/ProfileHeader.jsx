import { useState, useRef, useEffect } from "react";
import {
  LogOutIcon,
  VolumeOffIcon,
  Volume2Icon,
  Trash2Icon,
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser, updateProfile, deleteAccount, isDeletingAccount } =
    useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "This will permanently delete your account, messages, and images. This action cannot be undone.",
    );

    if (!confirmed) return;

    await deleteAccount();
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="p-6 border-b border-slate-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* AVATAR */}
          <div className="avatar online">
            <button
              className="size-14 rounded-full overflow-hidden relative group"
              onClick={() => fileInputRef.current.click()}
            >
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="User image"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs">Change</span>
              </div>
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* USERNAME & ONLINE TEXT */}
          <div>
            <h3 className="text-slate-200 font-medium text-base max-w-[180px] truncate">
              {authUser.fullName}
            </h3>

            <p className="text-slate-400 text-xs">Online</p>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 items-center" ref={menuRef}>
          {/* MENU BTN */}
          <div className="relative">
            <button
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700/60 px-3 py-1.5 rounded-md"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <LogOutIcon className="size-5" />
              <ChevronDown className="size-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-slate-800 border border-slate-700/60 rounded-md shadow-lg z-20">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700/70 flex items-center gap-2"
                >
                  <LogOutIcon className="size-4" />
                  Logout
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="w-full text-left px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 flex items-center gap-2 disabled:opacity-60"
                  disabled={isDeletingAccount}
                >
                  <Trash2Icon className="size-4" />
                  {isDeletingAccount ? "Deleting..." : "Delete account"}
                </button>
              </div>
            )}
          </div>

          {/* SOUND TOGGLE BTN */}
          <button
            className="text-slate-400 hover:text-slate-200 transition-colors"
            onClick={() => {
              // play click sound before toggling
              mouseClickSound.currentTime = 0; // reset to start
              mouseClickSound
                .play()
                .catch((error) => console.log("Audio play failed:", error));
              toggleSound();
            }}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-5" />
            ) : (
              <VolumeOffIcon className="size-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
export default ProfileHeader;
