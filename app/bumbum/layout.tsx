export default function BumbumLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: '100%',
      flex: '1 1 auto',
      alignSelf: 'stretch',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {children}
    </div>
  )
}
