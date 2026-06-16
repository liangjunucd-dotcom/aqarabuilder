import { redirect } from 'next/navigation'

// LocalUser auth is handled as a sheet modal on /life/studios
// This stub ensures the prototype switcher link resolves
export default function LocalAuthPage() {
  redirect('/life/studios')
}
