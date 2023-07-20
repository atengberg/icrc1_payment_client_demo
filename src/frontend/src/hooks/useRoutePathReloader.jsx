import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/** Reloads the current route (and state) if the browser is refreshed (otherwise if user refreshes the page will 
 * cause the router to direct to base route as a result of how routes are split on the isAuthenticated boolean.) */
const useRoutePathReloader = () => {
  const { pathname, state } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    performance.getEntriesByType('navigation').filter(({ type }) => {
      if (type === 'reload') {
        // replace is necessary so the nav history stack stays clean (otherwise it will duplicate). 
        if (state) {
          navigate(pathname, { state, replace: true })
        } else {
          navigate(pathname, { replace: true })
        }
      }
    });
  // Only care about pathname, as specific (path) state will already be synchronized to pathname. 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, navigate])
};

export default useRoutePathReloader;
