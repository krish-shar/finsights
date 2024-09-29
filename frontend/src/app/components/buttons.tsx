"use client";
import React from "react";

export const CompanyButton = ({ company }: { company: string }) => {
  return (
    <button className="px-12 py-4 flex-col items-center justify-evenly rounded-3xl bg-accent font-bold text-white tracking-widest uppercase transform hover:scale-105 hover:brightness-90 duration-200 transition-all">
      <img
        src="https://via.placeholder.com/100x100"
        alt="https://via.placeholder.com/100x100"
        className="py-2"
      />
      <div>{company}</div>
    </button>
  );
};

export const LoginButton = ({
  onClick,
}: {
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}) => {
  return (
    <div className="inset-0 bg-gradient-to-r from-accent-light to-accent-dark rounded-full">
      <button className="p-1 relative" onClick={onClick}>
        <div className="px-4 py-1 bg-black rounded-full relative group transition duration-300 text-white hover:bg-transparent">
          Login
        </div>
      </button>
    </div>
  );
};

export const DropdownButton = ({
  text,
  onClick,
}: {
  text: string;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}) => {
  return (
    <button className="p-[3px] relative" onClick={onClick}>
      <div className="px-4 bg-black rounded-full relative group transition duration-300 text-white text-xl font-bold hover:bg-transparent">
        {text}
      </div>
    </button>
  );
};
