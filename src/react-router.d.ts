import '@react-router';

declare module 'react-router-dom' {
  interface LocationState {
    startTour?: boolean;
  }
}
