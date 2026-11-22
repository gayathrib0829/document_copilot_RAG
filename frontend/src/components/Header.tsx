
import { Search, Bell } from "lucide-react";

function Header() {
  return (
    <header className="header">
      <div>
        <h2>Research Workspace</h2>
        <p>Manage your documents and ask AI questions.</p>
      </div>

      <div className="header-actions">
        <button className="icon-button">
          <Search size={19} />
        </button>
        <button className="icon-button">
          <Bell size={19} />
        </button>
      </div>
    </header>
  );
}

export default Header;
