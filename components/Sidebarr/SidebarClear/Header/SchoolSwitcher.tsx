"use client";
import { useEffect, useState } from "react";
import { getProfile } from "@/actions/getProfile";

type SchoolOption = { schoolId: string; name?: string | null };

export default function SchoolSwitcher() {
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [value, setValue] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const res = await getProfile();
      if ((res as any).error) return;
      const data: any = (res as any).data;
      const list = (data.schools || []) as any[];
      setSchools(list.map((s) => ({ schoolId: s.schoolId, name: s.name || s.schoolId })));
      const cookieVal = document.cookie.split(';').find(c=>c.trim().startsWith('schoolId='))?.split('=')[1];
      setValue(cookieVal || data.selectedSchoolId || (list[0]?.schoolId ?? ""));
    };
    init();
  }, []);

  const onChange = async (schoolId: string) => {
    setValue(schoolId);
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/active-school`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ schoolId }) });
      if (res.ok) {
        document.cookie = `schoolId=${schoolId}; Path=/; SameSite=Lax`;
        localStorage.setItem("schoolId", schoolId);
        // Option: rafraîchir pour recharger branding/ACL
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!schools.length) return null;

  return (
    <select
      className="border rounded px-2 py-1 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
      aria-label="Sélection d'école"
    >
      {schools.map((s) => (
        <option key={s.schoolId} value={s.schoolId}>
          {s.name || s.schoolId}
        </option>
      ))}
    </select>
  );
}


