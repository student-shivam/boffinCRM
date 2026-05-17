import { createSlice } from '@reduxjs/toolkit';

const initialDarkMode = localStorage.getItem('darkMode') !== null
  ? localStorage.getItem('darkMode') === 'true'
  : true;

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    darkMode: initialDarkMode,
    mobileSidebarOpen: false,
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    toggleMobileSidebar: (state) => { state.mobileSidebarOpen = !state.mobileSidebarOpen; },
    closeMobileSidebar: (state) => { state.mobileSidebarOpen = false; },
  },
});

export const { toggleSidebar, toggleDarkMode, toggleMobileSidebar, closeMobileSidebar } = uiSlice.actions;
export default uiSlice.reducer;
