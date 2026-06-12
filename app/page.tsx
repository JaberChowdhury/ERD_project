"use client";
import dynamic from 'next/dynamic';

const App = dynamic(() => import('../src/App'), {
  ssr: false, // Ensure this completely client-side rendered since it heavily uses window/canvas
});

export default function Page() {
  return <App />;
}
