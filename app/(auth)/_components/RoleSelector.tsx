"use client";

type Role = "musician" | "organizer";

interface Props {
  value: Role | null;
  onChange: (role: Role) => void;
}

export default function RoleSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => onChange("musician")}
        className={`border rounded-xl p-4 text-left transition
          ${
            value === "musician"
              ? "border-black bg-black text-white"
              : "border-gray-300 hover:border-black"
          }`}
      >
        <h3 className="font-semibold text-lg">🎸 Musician</h3>
        <p className="text-sm opacity-80 mt-1">
          Find gigs, apply to events, grow your network
        </p>
      </button>

      <button
        type="button"
        onClick={() => onChange("organizer")}
        className={`border rounded-xl p-4 text-left transition
          ${
            value === "organizer"
              ? "border-black bg-black text-white"
              : "border-gray-300 hover:border-black"
          }`}
      >
        <h3 className="font-semibold text-lg">🎤 Organizer</h3>
        <p className="text-sm opacity-80 mt-1">
          Post gigs, hire musicians, manage events
        </p>
      </button>
    </div>
  );
}
