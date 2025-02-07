import { createSlice } from "@reduxjs/toolkit";

const eventSlice = createSlice({
  name: "events",
  initialState: { list: [] },
  reducers: {
    setEvents: (state, action) => {
      state.list = action.payload;
    },
    addEvent: (state, action) => {
      state.list.push(action.payload);
    },
  },
});

export const { setEvents, addEvent } = eventSlice.actions;
export default eventSlice.reducer;
