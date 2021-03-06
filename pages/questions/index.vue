<template>
  <div
    class="vx-row w-full relative justify-evenly"
    :class="[{ 'show-overlay': bodyOverlay }]"
    id="notes-screen-container"
  >
    <div id="notes-content-overlay"></div>
    <FilterSidebar
      :sort.sync="sort"
      :subjects.sync="subjects"
      :school.sync="school"
      :grade.sync="grade"
      @filter="filter()"
    >
      <vs-button warn @click="questionModalActive = true" class="w-full">
        <i class="bx bxs-plus-square text-4xl" />
        <div class="text-2xl font-ginger-b">&nbsp; Ask A Question</div>
      </vs-button>
      <vs-button :color="toggleColor" @click="toggleListView()" class="w-full">
        <i class="bx bx-list-ul text-4xl" />
        <div class="text-2xl font-ginger-b">&nbsp; {{listViewText}}</div>
      </vs-button>
    </FilterSidebar>
    <div class="sidebar-spacer"></div>
    <div class="vx-col lg:w-2/3 md:w-2/3 w-full">
      <div class="vx-col w-full inline-flex lg:hidden" style>
        <div class="vx-row mb-4 w-full bg-white rounded-md p-2">
          <vs-avatar class="icon-small float-right" @click="openFilterSidebar()">
            <i class="bx bx-menu" style="font-size: 1.25rem;" />
          </vs-avatar>
        </div>
      </div>
      <VxCard
      v-if="listViewEnabled"
      fitContent="true"
      class="mb-8"
      style="background-color:#99b8d1 !important;"
      >
    <template slot="no-body">
      <div class="card-content py-1">
        <div class="w-full vx-row p-2 justify-start items-center text-sm flex-row my-2">
          <div class="w-1/12 vx-row list-icons"></div>
          <div class="w-2/5 vx-row list-title" style="overflow: hidden;white-space: nowrap;">
        <div class="text-ginger text-xl ml-4 text-white">Title</div>
      </div>
      <div class="w-1/6 vx-row list-date" style="overflow: hidden;white-space: nowrap;">
        <div class="text-ginger text-xl ml-4 text-white">Date Created</div>
      </div>
    <div class="w-1/6 vx-row list-name" style="overflow: hidden;white-space: nowrap;">
    <div class="text-ginger text-xl ml-4 text-white">Name</div>
  </div>
  <div class="w-1/6 vx-row justify-between pl-4 list-buttons"></div>
</div>
</div>
  </template>
  </VxCard>
      <QuestionCard
        v-for="(question, index) in questionList"
        :key="index"
        class
        :question="question"
        :clickable="true"
        :preview="true"
        :listView="listViewEnabled"
      />
      <vs-alert color="danger" v-if="noItemsFound">
        <template #title>No Questions Found For This Search</template>
        <b>Sorry!</b> Something went wrong when fetching the Question. Please Try
        Again.
      </vs-alert>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, mixins, Watch } from 'nuxt-property-decorator'

import { Question } from '~/types/questions'

import { windowStore, questionStore } from '~/store'
import FilterSidebar from '~/components/FilterSidebar.vue'
import QuestionCard from '~/components/QuestionCard.vue'
import { Subject_O, Grade_O } from '~/types/subjects'
import { School_O } from '~/types/schools'
import LoadScrollMixin from '~/mixins/LoadScrollMixin'

@Component<NotesPage>({
  components: { QuestionCard, FilterSidebar },
  async mounted() {
    if(this.questionList.length)
    {
      this.loaded = true;
      return;
    }
    const loading = this.$vs.loading()
    await questionStore.GetMoreQuestions(true)
    this.loaded = true;
    loading.close()
  }
})
export default class NotesPage extends mixins(LoadScrollMixin) {
  sort: typeof questionStore.SortSelect = 'magicRank'
  subjects: Subject_O[] = []
  grade: Grade_O = 'ALL'
  school: School_O | 'All Schools' = 'All Schools'
  listViewEnabled = false
  listViewText = "List View"
  toggleColor = "#99b8d1"
  @Watch('IsScrolledDown')
  PageHeightChange(val: boolean, oldVal: boolean) {
    if (!this.endOfList && val && this.loaded) {
      this.LoadMoreQuestions()
    }
  }
    toggleListView() {
    if(this.listViewEnabled) {
      this.listViewEnabled = false
      this.toggleColor = "#99b8d1"
      this.listViewText = "List View"
    }
    else {
      this.listViewEnabled = true
      this.toggleColor = "#6398de"
      this.listViewText = "Grid View"
      if (this.questionList.length < 10){
          this.LoadMoreQuestions()
      }
    }
  }

  
  async filter() {
    const loading = this.$vs.loading()
    try {
      questionStore.SetFilter({
        sortSelect: this.sort,
        filterSubjects: this.subjects,
        filterGrades: this.grade,
        filterSchools: this.school
      })
      await questionStore.GetMoreQuestions()
    } catch (error) {
      this.$vs.notification({
        title: error.message,
        color: 'danger'
      })
      console.error(error)
    }

    loading.close()
  }

  get noItemsFound() {
    return questionStore.EndOfList && this.questionList.length == 0
  }
  async LoadMoreQuestions() {
    const loading = this.$vs.loading()
    await questionStore.GetMoreQuestions()
    loading.close()
  }

  get endOfList() {
    return questionStore.EndOfList
  }
  get bodyOverlay() {
    return windowStore.filterSidebarOpen && windowStore.isSmallScreen
  }
  get previewModalActive() {
    return questionStore.PreviewModalOpen
  }

  get questionModalActive() {
    return questionStore.PostQuestionModalOpen
  }
  set questionModalActive(value: boolean) {
    questionStore.SET_POST_MODAL_OPEN(value)
  }
  openFilterSidebar() {
    windowStore.SetFilterSidebar(true)
  }

  get questionList() {
    return questionStore.ActiveItems
  }
}
</script>

<style lang="scss">

@media only screen and (max-width: 1670px) {
  .list-icons {
    width:15%;
  }
  .list-title{
    width:40%;
  }
  .list-date{
    display: none;
  }
  .list-buttons{
    width:20%;
  }
}

@media only screen and (max-width: 1300px) {
  .list-name{
    display:none;
  }
  .list-title{
    width:50%;
  }
  .list-buttons{
    width:30%;
  }
}

@media only screen and (max-width: 650px) {
  .list-icons {
    width:20%;
  }
  .list-title{
    width:40%;
  }
  .list-title div {
    font-size: 0.9rem !important;
    white-space: pre-wrap;
  }
  .list-buttons{
    width:40%;
  }
}

@media only screen and (max-width: 480px) {
  .list-icons {
    flex-direction:column;
    width:15%;
  }
  .list-title{
    width:60%;
  }
  .list-title div {
    font-size: 1rem !important;
  }
  .list-buttons{
    flex-direction:column;
    width: 15%;
  }
  .bottom-icon {
    margin-top: 1rem;
  }
}
</style>
