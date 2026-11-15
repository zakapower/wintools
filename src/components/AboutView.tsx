'use client'

import Link from 'next/link'
import { BookOpen, CircleAlert, ShieldCheck, Wrench } from 'lucide-react'
import { SiGithub } from '@icons-pack/react-simple-icons'
import { useApp } from '@/context/AppContext'
import './About.css'

const GITHUB_URL = 'https://github.com/zakapower/wintools'

export function AboutView() {
  const { t } = useApp()

  return (
    <article className="about">
      <section className="about-card">
        <span className="about-card__icon" aria-hidden>
          <Wrench strokeWidth={2} />
        </span>
        <div className="about-card__body">
          <h1>{t('О WinTools', 'About WinTools')}</h1>
          <p>
            {t(
              'WinTools помогает заранее настроить установку Windows 11. Можно выбрать язык, настроить диск и учётную запись, а также указать, какие приложения установить.',
              'WinTools helps you set up your Windows 11 installation in advance. Choose the language, configure the disk and account, and pick the apps you want to install.',
            )}
          </p>
        </div>
      </section>

      <section className="about-card">
        <span className="about-card__icon" aria-hidden>
          <ShieldCheck strokeWidth={2} />
        </span>
        <div className="about-card__body">
          <h2>{t('Настройки и файлы', 'Settings and files')}</h2>
          <p>
            {t(
              'WinTools открывает и создаёт XML прямо в браузере. Если вы задали пароль для учётной записи, он может сохраниться в файле в открытом виде. Такой файл лучше никому не пересылать.',
              'WinTools opens and creates XML files in your browser. If you set an account password, it may be saved in plain text. Keep that file to yourself.',
            )}
          </p>
        </div>
      </section>

      <section className="about-card">
        <span className="about-card__icon" aria-hidden>
          <CircleAlert strokeWidth={2} />
        </span>
        <div className="about-card__body">
          <h2>{t('Перед установкой', 'Before installing')}</h2>
          <p>
            {t(
              'Режим очистки удаляет данные с выбранного диска. Перед установкой проверьте, какой диск выбрали, и скопируйте важные файлы на другой носитель.',
              'Disk wipe mode erases data on the selected disk. Before installing, double-check the disk and back up important files to another drive.',
            )}
          </p>
        </div>
      </section>

      <div className="about-cta-row">
        <a
          className="about-cta"
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <SiGithub color="currentColor" size={20} title="" aria-hidden />
          <span>
            <strong>GitHub</strong>
            <em>{t('Код проекта и сообщения об ошибках', 'Project code and issue reports')}</em>
          </span>
        </a>
        <Link href="/guide" className="about-cta">
          <BookOpen strokeWidth={2} aria-hidden />
          <span>
            <strong>{t('Инструкция', 'Guide')}</strong>
            <em>
              {t('Как подготовить флешку и установить Windows', 'How to prepare the USB drive and install Windows')}
            </em>
          </span>
        </Link>
      </div>
    </article>
  )
}
