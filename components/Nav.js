'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/client';

const LINKS = {
  Admin:     [['/dashboard','Dashboard'],['/jobs','Jobs'],['/applications','Applications'],['/interviews','Interviews'],['/candidates','Candidates'],['/match','Semantic Match']],
  Recruiter: [['/dashboard','Dashboard'],['/jobs','Jobs'],['/applications','Applications'],['/interviews','Interviews'],['/candidates','Candidates'],['/match','Semantic Match']],
  Candidate: [['/jobs','Jobs'],['/match','Recommended Jobs'],['/applications','My Applications'],['/interviews','Interviews'],['/profile','My Profile']],
};

export default function Nav() {
  const [me, setMe] = useState(null);
  const path = usePathname(); const router = useRouter();
  useEffect(() => { api('/api/auth/me').then(setMe).catch(() => setMe(null)); }, [path]);
  if (!me) return <nav><b>RecruitIQ</b></nav>;
  return (
    <nav>
      <b>RecruitIQ</b>
      {LINKS[me.role].map(([h, t]) => <a key={h} href={h}>{t}</a>)}
      <span className="sp" />
      <small>{me.name} · {me.role}</small>
      <button className="sec" onClick={async () => { await api('/api/auth/logout', { method: 'POST' }); setMe(null); router.push('/login'); }}>Logout</button>
    </nav>
  );
}
