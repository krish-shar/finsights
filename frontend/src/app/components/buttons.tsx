"use client";
import React from "react";

export const CompanyButton = ({ company }: { company: string }) => {
  return (
    <button
      className="px-12 py-4 flex-col items-center justify-evenly rounded-3xl bg-accent font-bold text-white tracking-widest uppercase transform hover:scale-105 hover:brightness-90 transition-colors duration-200">
      <img src="https://via.placeholder.com/100x100"  alt="https://via.placeholder.com/100x100" className="py-2"/>
      <div>{ company }</div>
    </button>
  );
}