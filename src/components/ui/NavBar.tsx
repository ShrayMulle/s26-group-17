import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { BarChart3, GraduationCap, LayoutList, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

type TabKey = 'board' | 'analytics'

type NavBarProps = {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
  userName: string
  totalXp: number
  level: number
  onLogout: () => void
}

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function NavBar({ activeTab, onTabChange, userName, totalXp, level, onLogout }: NavBarProps) {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const navigation = [
    { icon: <LayoutList />, name: 'Dashboard', tab: 'board' as const, current: activeTab === 'board' },
    { icon: <BarChart3 />, name: 'Analytics', tab: 'analytics' as const, current: activeTab === 'analytics' },
  ]


  return (
    <Disclosure
      as="nav"
      className="relative bg-gray-300 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10"
    >
      <div className="mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <GraduationCap/>
              <h1 className='ml-2 font-semibold text-2xl'>StudyQuest</h1>
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => onTabChange(item.tab)}
                    aria-current={item.current ? 'page' : undefined}
                    className={classNames(
                      item.current ? 'bg-gray-950/50 text-white hover:bg-gray-950/55' : 'text-gray-700 hover:bg-white/40 hover:text-gray-900',
                      'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out',
                    )}
                  >
                    {item.icon}
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <div className="hidden sm:flex sm:flex-col sm:items-end sm:mr-3">
              <p className="text-sm font-semibold text-gray-900">{userName}</p>
              <p className="text-xs text-gray-700">Level {level} • {totalXp} XP</p>
            </div>
            <button
              type="button"
              onClick={() => setIsDark(v => !v)}
              className={classNames(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out',
                isDark
                  ? ' bg-gray-900 text-gray-100 hover:bg-gray-800'
                  : ' bg-white/70 text-gray-700 hover:bg-white',
              )}
              aria-label="Toggle dark mode"
            >
              <span className="inline-flex items-center gap-2">
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="ml-3 rounded-md bg-gray-950/50 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 ease-in-out hover:bg-gray-950/75"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="button"
              type="button"
              onClick={() => onTabChange(item.tab)}
              aria-current={item.current ? 'page' : undefined}
              className={classNames(
                item.current ? 'bg-gray-950/50 text-white' : 'text-gray-700 hover:bg-white/40 hover:text-gray-900',
                'block rounded-md px-3 py-2 text-base font-medium',
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  )
}
