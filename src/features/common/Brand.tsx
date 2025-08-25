import React from "react";
import { Link } from "react-router-dom";
import PeopleaIcon from "../../img/PeopleaIcon.png";

interface BrandProps {
  withMargin?: boolean; 
}

export default function Brand({ withMargin = false }: BrandProps) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-0 ${withMargin ? "mb-10" : ""}`}
    >
      <img
        src={PeopleaIcon}
        alt="Peoplea logo"
        className="h-20 w-20 block"
      />
      <span className="text-2xl font-extrabold tracking-tight text-slate-800">
        Peoplea
      </span>
    </Link>
  );
}