import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    currentUser:null,
    isLoggedIn:false,
    error:null,
    loading:false,
    accessToken:null,
    refreshToken:null
};

const userSlice = createSlice({
    name:'user',
    initialState,
    reducers: {
        signupStart:(state)=>{
            state.loading=true,
            state.error=null
        },
        signupSuccess: (state)=>{
            state.loading = false,
            state.error = null;
        },
        signupFailure: (state,action) => {
            state.loading = false;
            state.error = action.payload
        },
        loginStart: (state) => {
            state.loading = true,
            state.error = null
        },
        loginSuccess: (state,action) => {
            state.currentUser = action.payload.data.user;
            state.isLoggedIn = true;
            state.error = null;
            state.loading = false;
            state.accessToken = action.payload.data.accessToken;
            state.refreshToken = action.payload.data.refreshToken;
            console.log(state.currentUser);
        },
        loginFailure: (state,action) => {
            state.error = action.payload,
            state.loading = false;
        },
        updateStart:(state) => {
            state.error = null;
            state.loading = true
        },
        updateSuccess:(state,action) => {
            state.currentUser = action.payload,
            state.error = null,
            state.loading = false
            console.log(state.currentUser);
        },
        updateFailure:(state,action) => {
            state.error = action.payload,
            state.loading = false  
        },
        deleteUserStart: (state) => {
            state.loading = true;
            state.error = null;
          },
          deleteUserSuccess: (state) => {
            state.currentUser = null;
            state.isLoggedIn = false;
            state.loading = false;
            state.error = null;
            state.accessToken = null;
            state.refreshToken = null;
          },
          deleteUserFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
          },
          logoutStart: (state) =>{
            state.error = null;
            state.loading = true;
          },
          logoutSuccess: (state) => {
            state.currentUser = null;
            state.isLoggedIn = false;
            state.error = null;
            state.loading = false;
          }
    }
})

export const {
    signupStart,
    signupSuccess,
    signupFailure,
    loginStart,
    loginSuccess,
    loginFailure,
    updateStart,
    updateSuccess,
    updateFailure,
    deleteUserStart,
    deleteUserSuccess,
    deleteUserFailure,
    logoutStart,
    logoutSuccess
} = userSlice.actions;

export default userSlice.reducer