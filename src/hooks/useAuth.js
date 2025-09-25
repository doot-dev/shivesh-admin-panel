import { useSelector, useDispatch } from "react-redux";
import { login } from "../features/auth/authThunks";
import { logout } from "../features/auth/authSlice";

export const useAuth = () => {
  const { user, token, loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return {
    user,
    token,
    loading,
    error,
    login: (credentials) => dispatch(login(credentials)),
    logout: () => dispatch(logout()),
  };
};
