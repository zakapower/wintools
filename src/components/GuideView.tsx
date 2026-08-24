'use client'

import Link from 'next/link'
import {
  Disc3,
  FileCode2,
  Flame,
  HardDrive,
  KeyRound,
  Package,
  Usb,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import './About.css'

export function GuideView() {
  const { t, lang } = useApp()

  return (
    <article className="about">
      <header className="about__head">
        <p className="about__kicker">{t('Установка', 'Setup')}</p>
        <h1>{t('Инструкция', 'Guide')}</h1>
        <p className="about__lead">
          {t(
            'Скачайте файл настроек, запишите флешку и поставьте Windows 11 без вопросов установщика.',
            'Download the answer file, write a USB stick, and install Windows 11 without Setup questions.',
          )}
        </p>
      </header>

      <section className="about-panel">
        <h2>{t('Что нужно', 'What you need')}</h2>
        <ul className="about-tiles">
          <li className="about-tile">
            <span className="about-tile__icon" aria-hidden>
              <Usb strokeWidth={2} />
            </span>
            <p>
              {lang === 'ru' ? (
                <>
                  Флешка от 8 ГБ.{' '}
                  <span className="mark-critical">Всё на ней сотрётся.</span>
                </>
              ) : (
                <>
                  A USB stick, 8 GB or more.{' '}
                  <span className="mark-critical">Everything on it will be erased.</span>
                </>
              )}
            </p>
          </li>
          <li className="about-tile">
            <span className="about-tile__icon" aria-hidden>
              <Disc3 strokeWidth={2} />
            </span>
            <p>
              {t(
                'Образ Windows 11 (файл .iso), например с',
                'A Windows 11 image (.iso), for example from',
              )}{' '}
              <a
                href="https://massgrave.dev/genuine-installation-media"
                target="_blank"
                rel="noopener noreferrer"
              >
                massgrave.dev
              </a>
              .
            </p>
          </li>
          <li className="about-tile">
            <span className="about-tile__icon" aria-hidden>
              <Flame strokeWidth={2} />
            </span>
            <p>
              {t('Программа ', 'The ')}
              <a
                href="https://rufus.ie/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Rufus
              </a>{' '}
              {t('запишет образ на флешку.', 'app writes the image to the USB.')}
            </p>
          </li>
          <li className="about-tile">
            <span className="about-tile__icon" aria-hidden>
              <FileCode2 strokeWidth={2} />
            </span>
            <p>
              {t('Файл настроек с', 'The answer file from')}{' '}
              <Link href="/">{t('главной страницы', 'the home page')}</Link>.
            </p>
          </li>
        </ul>
      </section>

      <section className="about-panel">
        <h2>{t('Шаги', 'Steps')}</h2>
        <ol className="about-steps">
          <li>
            <span className="about-steps__n" aria-hidden>
              1
            </span>
            <p>
              {t(
                'На главной выберите язык, диск, имя ПК и программы. Нажмите «Скачать». Чтобы Windows ставилась сама, в блоке «Диск» включите авторазметку.',
                'On the home page pick language, disk, PC name, and apps. Click Download. For a hands-off install, turn on automatic layout in Disk.',
              )}
            </p>
          </li>
          <li>
            <span className="about-steps__n" aria-hidden>
              2
            </span>
            <p>
              {t(
                'В Rufus: флешка и .iso, GPT и UEFI не меняйте. Снимите «Windows User Experience», иначе подменит ваш файл.',
                'In Rufus pick the USB and .iso, leave GPT and UEFI. Uncheck Windows User Experience, or it replaces your file.',
              )}
            </p>
          </li>
          <li>
            <span className="about-steps__n" aria-hidden>
              3
            </span>
            <p>
              {t(
                'Скопируйте скачанный файл на флешку, в ту же папку, где лежит setup.exe. Имя не меняйте:',
                'Copy the downloaded file onto the USB, into the same folder as setup.exe. Do not rename it:',
              )}{' '}
              <code>autounattend.xml</code>.
            </p>
          </li>
          <li>
            <span className="about-steps__n" aria-hidden>
              4
            </span>
            <p>
              {t(
                'Вставьте флешку, включите ПК и сразу жмите F12 (иногда Esc, F10 или F2). Выберите флешку. Если есть UEFI и Legacy, выбирайте только UEFI.',
                'Plug in the USB, power on, and press F12 right away (sometimes Esc, F10, or F2). Pick the USB. If you see UEFI and Legacy, choose UEFI.',
              )}
            </p>
          </li>
          <li>
            <span className="about-steps__n" aria-hidden>
              5
            </span>
            <p>
              {t(
                'Дождитесь конца установки. После входа в Windows не выключайте ПК сразу: ещё ставятся программы и настройки.',
                'Wait until Setup finishes. After you sign in, do not power off right away: apps and tweaks still install.',
              )}
            </p>
          </li>
        </ol>
      </section>

      <section className="about-panel">
        <h2>{t('Важно', 'Important')}</h2>
        <ul className="about-alerts">
          <li className="about-alert about-alert--critical">
            <span className="about-alert__icon" aria-hidden>
              <HardDrive strokeWidth={2} />
            </span>
            <p>
              {lang === 'ru' ? (
                <>
                  Авторазметка{' '}
                  <span className="mark-critical">сотрёт диск компьютера</span>, не
                  флешку. Второй диск нельзя трогать, разметьте сами в установщике.
                </>
              ) : (
                <>
                  Automatic layout{' '}
                  <span className="mark-critical">erases the PC disk</span>, not the
                  USB. If a second disk must stay, partition it yourself in Setup.
                </>
              )}
            </p>
          </li>
          <li className="about-alert about-alert--critical">
            <span className="about-alert__icon" aria-hidden>
              <KeyRound strokeWidth={2} />
            </span>
            <p>
              {lang === 'ru' ? (
                <>
                  Пароль из генератора{' '}
                  <span className="mark-critical">виден в файле как текст</span>. Лучше
                  оставить пустым и задать уже в Windows.
                </>
              ) : (
                <>
                  The generator password is{' '}
                  <span className="mark-critical">visible in the file</span>. Safer to
                  leave it empty and set one in Windows later.
                </>
              )}
            </p>
          </li>
          <li className="about-alert about-alert--critical">
            <span className="about-alert__icon" aria-hidden>
              <Package strokeWidth={2} />
            </span>
            <p>
              {t(
                'Отмеченные программы скачаются сами после входа в Windows. Ставьте только знакомые.',
                'Checked apps download themselves after you sign in. Only pick ones you trust.',
              )}
            </p>
          </li>
        </ul>
      </section>
    </article>
  )
}
