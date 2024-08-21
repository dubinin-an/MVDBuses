<template>
  <q-layout view="hHh lpR fFf">

    <q-header bordered class="bg-primary text-white">
      <q-toolbar>
<!--        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />-->

        <q-toolbar-title>
<!--          <q-avatar>-->
<!--            <img src="/src/assets/bus.svg" alt="" width="32" height="32" />-->
<!--          </q-avatar>-->

          <div class="row items-center">
            <div class="col-auto">
              <q-avatar font-size="32" icon="fa-solid fa-bus-simple" />

            </div>
            <div class="col">
            MVD Buses
            </div>
            <div class="col-auto">
              <q-icon
                v-if="lines.length>0 && $q.platform.is.mobile"
                name="clear" @click="clearPayload"/>
            </div>
            <div class="col">
              <SearchComponent v-if="$q.platform.is.desktop"/>
            </div>
          </div>



        </q-toolbar-title>
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
import { computed, ref } from 'vue'
import SearchComponent from 'components/Search/SearchComponent.vue'
import { useBusOnlineMarkersStore } from 'stores/useBusOnlineMarkersStore'
import { searchBus } from 'components/Search/SearchController'

defineOptions({
  name: 'MainLayout'
})

const busOnlineStore = useBusOnlineMarkersStore();
const lines = computed(() => busOnlineStore.busPayload.lineas)
const clearPayload = () => {
 searchBus('')
}

const leftDrawerOpen = ref(false)
const rightDrawerOpen = ref(false)
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
const toggleRightDrawer = () => {
  rightDrawerOpen.value = !rightDrawerOpen.value
}
</script>

<style scoped>
.q-header{
  height: 6vh;
}
.q-toolbar {
  min-height: 0;
  height: 100%;
}
</style>
