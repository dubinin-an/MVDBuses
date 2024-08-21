<script setup>
import { computed, ref, watch } from 'vue'
import { searchBus, searchCompany } from 'components/Search/SearchController'
import { useBusOnlineMarkersStore } from 'stores/useBusOnlineMarkersStore'

const searchText = ref('')
const model = ref('Bus')
const company = ref('-1')
const options = ['Bus', 'Stop', 'Company']
const companyOptions = ref([
  {value:"-1", label:"ALL"},
  {value:"50", label:"CUTCSA"},
  {value:"70", label:"UCOT"},
  {value:"10", label:"COETC"},
  {value:"20", label:"COME"},
])
const busOnlineStore = useBusOnlineMarkersStore();
const lines = computed(() => busOnlineStore.busPayload.lineas)
watch(lines, () => searchText.value = lines.value.join(", "))
const search = () => {
  console.log('searchText.value', searchText.value)

  if (model.value === 'Company') searchCompany(company.value.value)
  if (model.value === 'Bus') searchBus(searchText.value)
  // if (model.value === 'Stop') {}
}
const clearSearch = () => {
  searchText.value = ''
  search()
}
const changeMode = () => {
  company.value = '-1'
  searchText.value = ''
}


</script>

<template>
  <div
    class="q-col-gutter-lg"
    :class="$q.platform.is.desktop ? 'row' : 'column q-pa-sm q-gutter-sm'"
  >
<!--  <div class="row">-->
    <div :class="$q.platform.is.desktop ? 'col-3' : 'col'">
      <q-select class="searchType"
                :class="$q.platform.is.desktop ? 'white' : ''"
                borderless dense v-model="model" :options="options" label="Search type" @update:model-value="changeMode"/>
    </div>
    <div class="col">
      <q-select v-if="model==='Company'" bg-color="white"
                :rounded="$q.platform.is.desktop"
                outlined dense map-options v-model="company" :options="companyOptions" label="Search company" @update:model-value="search" />
      <q-input v-else
               class="searchText"
               :class="$q.platform.is.desktop ? 'white' : ''"
               v-model="searchText" dense :label="model==='Bus' ? 'Buses numbers' : 'Stop name'" >
        <template v-slot:append>
          <q-icon v-if="searchText !== ''" name="close" @click="clearSearch" class="cursor-pointer" />
        </template>
      </q-input>
    </div>
    <div v-if="$q.platform.is.desktop" class="col-2">
      <q-btn v-if="model!=='Company'" round flat color="white" icon="search" :disable="searchText.length===0" @click="search" />
    </div>
    <div v-else class="col">
      <q-btn v-if="model!=='Company'" color="primary" class="full-width" icon="search" :disable="searchText.length===0" @click="search" />
    </div>
  </div>
</template>

<style lang="scss">
.searchType, .searchText {
  &.white{
    .q-field__native, .q-field__append, .q-field__label{
      color: white !important;
    }
  }
}
</style>
