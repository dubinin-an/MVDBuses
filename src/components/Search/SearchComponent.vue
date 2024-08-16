<script setup>
import { ref } from 'vue'
import { searchBus, searchCompany } from 'components/Search/SearchController'

const searchText = ref('')
const model = ref('Company')
const company = ref('-1')
const options = ['Company', 'Bus', 'Stop']
const companyOptions = ref([
  {value:"-1", label:"ALL"},
  {value:"50", label:"CUTCSA"},
  {value:"70", label:"UCOT"},
  {value:"10", label:"COETC"},
  {value:"20", label:"COME"},
])

const search = () => {
  if (model.value === 'Company') searchCompany(company.value.value)
  if (model.value === 'Bus') searchBus(searchText.value)
  // if (model.value === 'Stop') {}
}
const changeMode = () => {
  company.value = '-1'
  searchText.value = ''
}


</script>

<template>
  <div
    :class="$q.platform.is.desktop ? 'row' : 'column q-pa-sm q-gutter-sm'"
  >
    <div :class="$q.platform.is.desktop ? 'col-5' : 'col'">
      <q-select outlined dense v-model="model" :options="options" label="Search type" @update:model-value="changeMode"/>
    </div>
    <div class="col">
      <q-select v-if="model==='Company'" outlined dense map-options v-model="company" :options="companyOptions" label="Search company" @update:model-value="search" />
      <q-input v-else v-model="searchText" dense label="Buses numbers" />
    </div>
    <div v-if="$q.platform.is.desktop" class="col-2">
      <q-btn v-if="model!=='Company'" round flat color="white" icon="search" :disable="searchText.length===0" @click="search" />
    </div>
    <div v-else class="col">
      <q-btn v-if="model!=='Company'" color="primary" class="full-width" icon="search" :disable="searchText.length===0" @click="search" />
    </div>
  </div>
</template>

<style scoped>

</style>
