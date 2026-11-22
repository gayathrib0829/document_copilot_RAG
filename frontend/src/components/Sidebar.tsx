
import {
  FileText,
  MessageSquare,
  LayoutDashboard,
  Plus,
  Brain,
  LogOut
} from "lucide-react";

export type Section =
  | "dashboard"
  | "documents"
  | "conversations";

interface SidebarProps {
  activeSection: Section;
  onNavigate: (section: Section) => void;
  onLogout: () => void;
}

function Sidebar({
  activeSection,
  onNavigate,
  onLogout
}: SidebarProps) {
  return (
    <aside className="sidebar">

      <div className="brand">
        <Brain size={27} />
        <span>Document Copilot</span>
      </div>

      <button
        className="new-chat"
        onClick={() => onNavigate("dashboard")}
      >
        <Plus size={18} />
        New conversation
      </button>

      <nav>
        <button
          className={`nav-item ${
            activeSection === "dashboard" ? "active" : ""
          }`}
          onClick={() => onNavigate("dashboard")}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>

        <button
          className={`nav-item ${
            activeSection === "documents" ? "active" : ""
          }`}
          onClick={() => onNavigate("documents")}
        >
          <FileText size={18} />
          My Documents
        </button>

        <button
          className={`nav-item ${
            activeSection === "conversations" ? "active" : ""
          }`}
          onClick={() => onNavigate("conversations")}
        >
          <MessageSquare size={18} />
          Conversations
        </button>
      </nav>

      <div className="sidebar-bottom">

        <button
          className="nav-item logout-button"
          onClick={onLogout}
        >
          <LogOut size={18} />
          Logout
        </button>

        <div className="profile">
          <div className="avatar">G</div>

          <div>
            <strong>My Workspace</strong>
            <small>Personal account</small>
          </div>
        </div>

      </div>
    </aside>
  );
}

export default Sidebar;
