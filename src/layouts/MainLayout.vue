<template>
  <q-layout view="hHh lpR fFf">

    <q-header bordered class="bg-primary text-white" style="height: 6vh">
      <q-toolbar>
<!--        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />-->

        <q-toolbar-title>
<!--          <q-avatar>-->
            <img src="/src/assets/bus.svg" alt="" width="32" height="32" />
<!--          </q-avatar>-->
          Title
        </q-toolbar-title>
        <q-space />
        <SearchComponent v-if="$q.platform.is.desktop"/>

        <q-btn dense flat round icon="menu" v-if="$q.platform.is.mobile" @click="toggleRightDrawer" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" overlay elevated>
      <!-- drawer content -->
    </q-drawer>

    <q-drawer v-model="rightDrawerOpen" side="right" overlay elevated>
      <!-- drawer content -->
      <SearchComponent v-if="$q.platform.is.mobile"/>

    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import SearchComponent from 'components/Search/SearchComponent.vue'

defineOptions({
  name: 'MainLayout'
})

const leftDrawerOpen = ref(false)
const rightDrawerOpen = ref(false)
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
const toggleRightDrawer = () => {
  rightDrawerOpen.value = !rightDrawerOpen.value
}
</script>
