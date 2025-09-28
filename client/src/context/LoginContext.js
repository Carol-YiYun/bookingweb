

import { createContext, useEffect, useReducer } from "react"
import { login_failure, login_success, logout, start_login } from "../constants/actionTypes";

// 安全讀 localStorage，避免 JSON.parse("undefined") 崩潰
const safeGetUser = () => {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};


const INITIAL_STATE = {
    // user: JSON.parse(localStorage.getItem("user")) || null,
    user: safeGetUser(), 
    loading: false,
    error: null
}


export const LoginContext = createContext(INITIAL_STATE);

const LoginReducer = (state, action) => {
    switch (action.type) {
        case start_login:
            return {
                user: null,
                loading: true,
                error: null
            };
        case login_success: 
            // 兼容後端回傳 { token, user } 或直接 user
            const user = action.payload?.user || action.payload || null;

            return {
                // user: action.payload,
                user,
                loading: false,
                error: null
            };
        case login_failure:
            return {
                user: null,
                loading: false,
                error: action.payload
            };
        case logout:
            return {
                user: null,
                loading: false,
                error: null
            };
        default:
            return state
    }
}

export const LoginContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(LoginReducer, INITIAL_STATE)

    // useEffect(() => {
    //     localStorage.setItem("user", JSON.stringify(state.user))
    // }, [state.user])

    // 正確寫入/清除，避免把 "undefined" 字串寫進 localStorage
    useEffect(() => {
        if (state.user) {
            localStorage.setItem("user", JSON.stringify(state.user));
        } else {
            localStorage.removeItem("user");
        }
    }, [state.user]);


    return (
        <LoginContext.Provider
            value={{
                user: state.user,
                loading: state.loading,
                error: state.error,
                dispatch,
            }}>
            {children}
        </LoginContext.Provider>
    )
}

