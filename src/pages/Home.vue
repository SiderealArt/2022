<!--
  Copyright (c) 2020 DevilTea

  This software is released under the MIT License.
  https://opensource.org/licenses/MIT
-->

<template>
  <main id="home" class="page-container">
    <div class="banner-container">
        <div class="logo-container">
      </div>
    </div>
    <div class="info-container">
      <span class="date">2022/07/30 ~ 2022/07/31</span>
      <!-- <div class="info">
        <a class="venue" href="https://blog.coscup.org/2021/07/all-virtual-venues-opening-hours.html" target="_blank">
          {{ t('home.info.virtual_venue') }}
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1.0em" height="1.0em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 512 512" class="suffix-icon"><path d="M432 320h-32a16 16 0 0 0-16 16v112H64V128h144a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16H48a48 48 0 0 0-48 48v352a48 48 0 0 0 48 48h352a48 48 0 0 0 48-48V336a16 16 0 0 0-16-16zM488 0H360c-21.37 0-32.05 25.91-17 41l35.73 35.73L135 320.37a24 24 0 0 0 0 34L157.67 377a24 24 0 0 0 34 0l243.61-243.68L471 169c15 15 41 4.5 41-17V24a24 24 0 0 0-24-24z" fill="currentColor"></path></svg>
        </a>
        <a class="venue" href="https://www.youtube.com/playlist?list=PLqfib4St70XOsknW4ywpfoF3ZTE29tZHU" target="_blank">
          {{ t('home.info.online_conference') }}
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1.0em" height="1.0em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 512 512" class="suffix-icon"><path d="M432 320h-32a16 16 0 0 0-16 16v112H64V128h144a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16H48a48 48 0 0 0-48 48v352a48 48 0 0 0 48 48h352a48 48 0 0 0 48-48V336a16 16 0 0 0-16-16zM488 0H360c-21.37 0-32.05 25.91-17 41l35.73 35.73L135 320.37a24 24 0 0 0 0 34L157.67 377a24 24 0 0 0 34 0l243.61-243.68L471 169c15 15 41 4.5 41-17V24a24 24 0 0 0-24-24z" fill="currentColor"></path></svg>
        </a>
      </div> -->
      <!-- <router-link
        class="announcement-toggle"
        :to="{
          query: {
            popUp: 'announcement',
          },
        }"
      >
        <span>
          {{ t('home.info.tabs.announcement') }}
        </span>
      </router-link> -->
    </div>

    <section
      v-for="section in sections"
      :key="`section-${section.name}`"
      class="section-block"
    >
      <img class="prefix-icon" src="@/assets/images/logo.svg" />
      <h2 class="section-title">
        {{ section.title }}
      </h2>
      <article
        class="section-content notice markdown"
        v-html="section.content"
      ></article>
    </section>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import markdown from '@/utils/markdown'
import '@/assets/scss/pages/home.scss'
import { useI18n } from 'vue-i18n'

interface Section {
  name: 'notice' | 'about';
  title: string;
  content: string;
}

export default defineComponent({
  name: 'Home',
  setup () {
    const { t, locale } = useI18n()
    const sections = ref<Section[]>([])
    watch(locale, async () => {
      sections.value = [
        // {
        //   name: 'notice',
        //   title: t('home.notice.title'),
        //   content: markdown(t('home.notice.content'))
        // },
        {
          name: 'about',
          title: t('home.about.title'),
          content: markdown(t('home.about.content'))
        }
      ]
    }, {
      immediate: true
    })

    return {
      t,
      sections
    }
  }
})
</script>
