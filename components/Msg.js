export default function Msg({ m }) {
  if (!m) return null;
  return <div className={'msg' + (m.ok ? ' good' : '')}>{m.text}</div>;
}
