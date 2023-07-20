import useCanister from "../feature/canister-provider/useCanister";
import { RiLoginCircleLine, RiLogoutCircleRFill } from "./Icons";

const LoginoutWidget = () => {
  const { isAuthenticated, login, logout } = useCanister();
  return (
    <button 
      aria-pressed={isAuthenticated}
      title={`${isAuthenticated ? "Logout" : "Login"}`}
      aria-labelledby='toggle-authentication-label'
      role="switch"
      onClick={() => isAuthenticated ? logout() : login()} 
    >
      {isAuthenticated 
        ? <RiLogoutCircleRFill aria-hidden={true} className="stylish-menu-icon" />
        : <RiLoginCircleLine aria-hidden={true} className="stylish-menu-icon" />
      }
      <label className="sr-only" id="toggle-authentication-label" name="toggle-authentication-label"
      >
        {`${isAuthenticated ? "logout" : "login in a new browser window and it will return automatically after logging in"}`}
      </label>
    </button>
  );
};

export default LoginoutWidget;