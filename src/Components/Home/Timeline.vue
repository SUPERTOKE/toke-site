<script setup>
import { onMounted } from 'vue';
import AOS from 'aos'
import 'aos/dist/aos.css'

onMounted(() => {
  AOS.init();
});
</script>

<template>
  <!-- Roadmap Section -->
  <div class="relative scroll-mt-20" id="Timeline">
    <!-- Background Effects -->
    <div class="absolute inset-0 bg-gradient-to-b from-neutral-900/80 to-neutral-950/80">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]">
      </div>
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl"></div>
      <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl"></div>
    </div>

    <div class="relative container mx-auto px-6 py-32 pb-48">
      <!-- Section Title -->
      <div class="text-center mb-16">
        <p class="font-orbitron text-3xl sm:text-5xl md:text-6xl font-semibold text-center pb-3 relative leading-tight">
          <span class="text-white">
            <span class="text-white">TOKEVERSE BUILDS</span>
          </span>
        </p>
        <!-- <p class="text-neutral-400 font-exo max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="100">
          The journey of $TOKE, from inception to future milestones
        </p> -->
      </div>

      <!-- Timeline -->
      <div class="relative">
        <!-- Center Timeline Line -->
        <div
          class="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gradient-to-b from-sky-500/50 to-purple-500/50">
        </div>

        <!-- Timeline Items Container -->
        <div class="relative space-y-20">
          <!-- TOKE Machine & Wheel Section -->
          <div class="relative">
            <!-- Icon for section -->
            <div class="flex items-center justify-center mb-4">
              <div class="relative w-12 h-12 flex items-center justify-center z-10 bg-neutral-950/80 rounded-full">
                <div class="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 rounded-full blur-xl">
                </div>
                <svg class="relative w-8 h-8 text-sky-500" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </div>
            </div>
            <!-- Cards Container -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- TOKE Machine Card -->
              <div class="bg-neutral-900/30 backdrop-blur-xl rounded-2xl border border-white/[0.05] p-8"
                data-aos="fade-right">
                <div class="flex items-center gap-4 mb-4">
                  <div class="relative w-10 h-10 flex items-center justify-center">
                    <div
                      class="absolute inset-0 bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-purple-500/20 rounded-xl animate-gradient">
                    </div>
                    <div class="absolute inset-0 rounded-xl border border-white/10 backdrop-blur-sm"></div>
                    <svg class="relative w-6 h-6 text-sky-500" viewBox="0 0 24 24" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                      <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                      <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                    </svg>
                  </div>
                  <h3 class="font-orbitron text-2xl text-white">STAKING</h3>
                </div>
                <!-- <ul class="space-y-3 text-neutral-300 font-exo">
                  <li class="flex items-center gap-3">
                    <span class="text-sky-500 text-xl">•</span>
                    Take a hit of $TOKE and become part of the TOKE Community instantly.
                  </li>
                </ul> -->
                <div class="mt-8">
                  <div
                    class="group relative px-4 py-3 bg-neutral-900/50 rounded-xl transition-all duration-300 opacity-50 cursor-not-allowed">
                    <div
                      class="absolute inset-0 bg-sky-500/10 rounded-xl blur-md group-hover:bg-sky-500/20 transition-all duration-300">
                    </div>
                    <!-- <button class="relative flex items-center justify-center w-full gap-3" disabled>
                      <svg class="w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                          stroke-linejoin="round" />
                      </svg>
                      <span class="text-neutral-200 font-orbitron text-sm">COMING SOON</span>
                    </button> -->
                  </div>
                </div>
              </div>
              <!-- Wheel Card -->
              <div class="bg-neutral-900/30 backdrop-blur-xl rounded-2xl border border-white/[0.05] p-8"
                data-aos="fade-left">
                <div class="flex items-center gap-4 mb-4">
                  <div class="relative w-10 h-10 flex items-center justify-center">
                    <div
                      class="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20 rounded-xl animate-gradient">
                    </div>
                    <div class="absolute inset-0 rounded-xl border border-white/10 backdrop-blur-sm"></div>
                    <svg class="relative w-6 h-6 text-indigo-500" viewBox="0 0 24 24" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M20.59 13.41L13.42 20.58C13.2343 20.766 13.0137 20.9135 12.7709 21.0141C12.5281 21.1148 12.2678 21.1666 12.005 21.1666C11.7422 21.1666 11.4819 21.1148 11.2391 21.0141C10.9963 20.9135 10.7757 20.766 10.59 20.58L2 12V2H12L20.59 10.59C20.9625 10.9647 21.1716 11.4716 21.1716 12C21.1716 12.5284 20.9625 13.0353 20.59 13.41Z"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M7 7H7.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                    </svg>
                  </div>
                  <h3 class="font-orbitron text-2xl text-white">CEX</h3>
                </div>
                <!-- <ul class="space-y-3 text-neutral-300 font-exo">
                  <li class="flex items-center gap-3">
                    <span class="text-sky-500 text-xl">•</span>
                    Drop some $TOKE in a game of strategy and luck for a chance to earn rewards.
                  </li>
                </ul> -->
                <!-- <div class="mt-8">
                  <div
                    class="group relative px-4 py-3 bg-neutral-900/50 rounded-xl transition-all duration-300 opacity-50 cursor-not-allowed">
                    <div
                      class="absolute inset-0 bg-purple-500/10 rounded-xl blur-md group-hover:bg-purple-500/20 transition-all duration-300">
                    </div>
                    <button class="relative flex items-center justify-center w-full gap-3" disabled>
                      <svg class="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                          stroke-linejoin="round" />
                      </svg>
                      <span class="text-neutral-200 font-orbitron text-sm">COMING SOON</span>
                    </button>
                  </div>
                </div> -->
              </div>
            </div>
          </div>

          <!-- Shop & TOKE Sesh Section -->
          <div class="relative">
            <!-- <div class="flex items-center justify-center mb-4">
              <div class="relative w-12 h-12 flex items-center justify-center z-10 bg-neutral-950/80 rounded-full">
                <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-sky-500/20 rounded-full blur-xl">
                </div>
                <svg class="relative w-8 h-8 text-indigo-500" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z"
                    stroke="currentColor" stroke-width="2" />
                </svg>
              </div>
            </div> -->
            <!-- <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-neutral-900/30 backdrop-blur-xl rounded-2xl border border-white/[0.05] p-8"
                data-aos="fade-right">
                <div class="flex items-center gap-4 mb-4">
                  <div class="relative w-10 h-10 flex items-center justify-center">
                    <div
                      class="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-sky-500/20 to-blue-500/20 rounded-xl animate-gradient">
                    </div>
                    <div class="absolute inset-0 rounded-xl border border-white/10 backdrop-blur-sm"></div>
                    <svg class="relative w-6 h-6 text-indigo-500" viewBox="0 0 24 24" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z"
                        stroke="currentColor" stroke-width="2" />
                    </svg>
                  </div>
                  <h3 class="font-orbitron text-2xl text-white">------</h3>
                </div>

                <div class="mt-8">
                  <div
                    class="group relative px-4 py-3 bg-neutral-900/50 rounded-xl transition-all duration-300 opacity-50 cursor-not-allowed">
                    <div
                      class="absolute inset-0 bg-indigo-500/10 rounded-xl blur-md group-hover:bg-indigo-500/20 transition-all duration-300">
                    </div>
                    <button class="relative flex items-center justify-center w-full gap-3" disabled>
                      <svg class="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                          stroke-linejoin="round" />
                      </svg>
                      <span class="text-neutral-200 font-orbitron text-sm">COMING SOON</span>
                    </button>
                  </div>
                </div>
              </div>
              <div class="bg-neutral-900/30 backdrop-blur-xl rounded-2xl border border-white/[0.05] p-8"
                data-aos="fade-left">
                <div class="flex items-center gap-4 mb-4">
                  <div class="relative w-10 h-10 flex items-center justify-center">
                    <div
                      class="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-sky-500/20 rounded-xl animate-gradient">
                    </div>
                    <div class="absolute inset-0 rounded-xl border border-white/10 backdrop-blur-sm"></div>
                    <svg class="relative w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        stroke="currentColor" stroke-width="2" />
                      <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" stroke-width="2" />
                      <path d="M9 9H9.01" stroke="currentColor" stroke-width="2" />
                      <path d="M15 9H15.01" stroke="currentColor" stroke-width="2" />
                    </svg>
                  </div>
                  <h3 class="font-orbitron text-2xl text-white">------</h3>
                </div>
 
                <div class="mt-8">
                  <div
                    class="group relative px-4 py-3 bg-neutral-900/50 rounded-xl transition-all duration-300 opacity-50 cursor-not-allowed">
                    <div
                      class="absolute inset-0 bg-blue-500/10 rounded-xl blur-md group-hover:bg-blue-500/20 transition-all duration-300">
                    </div>
                    <button class="relative flex items-center justify-center w-full gap-3" disabled>
                      <svg class="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                          stroke-linejoin="round" />
                      </svg>
                      <span class="text-neutral-200 font-orbitron text-sm">COMING SOON</span>
                    </button>
                  </div>
                </div>
              </div>
            </div> -->
          </div>

          <!-- <div class="relative">
            <div class="flex items-center justify-center mb-4">
              <div class="relative w-12 h-12 flex items-center justify-center z-10 bg-neutral-950/80 rounded-full">
                <div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-xl">
                </div>
                <svg class="relative w-8 h-8 text-purple-500" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-neutral-900/30 backdrop-blur-xl rounded-2xl border border-white/[0.05] p-8"
                data-aos="fade-right">
                <div class="flex items-center gap-4 mb-4">
                  <div class="relative w-10 h-10 flex items-center justify-center">
                    <div
                      class="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-sky-500/20 to-blue-500/20 rounded-xl animate-gradient">
                    </div>
                    <div class="absolute inset-0 rounded-xl border border-white/10 backdrop-blur-sm"></div>
                    <svg class="relative w-6 h-6 text-indigo-500" viewBox="0 0 24 24" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </div>
                  <h3 class="font-orbitron text-2xl text-white">Scavenger</h3>
                </div>
                <ul class="space-y-3 text-neutral-300 font-exo">
                  <li class="flex items-center gap-3">
                    <span class="text-sky-500 text-xl">•</span>
                    Discover $TOKE you didn't know you had in a quick and efficient few clicks.
                  </li>
                </ul>
                <div class="mt-8">
                  <a href="https://scavenger.mctoken.xyz/" target="_blank"
                    class="group relative px-4 py-3 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-xl transition-all duration-300 block">
                    <div
                      class="absolute inset-0 bg-indigo-500/10 rounded-xl blur-md group-hover:bg-indigo-500/20 transition-all duration-300">
                    </div>
                    <button class="relative flex items-center justify-center w-full gap-3">
                      <svg class="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                          stroke-linejoin="round" />
                      </svg>
                      <span class="text-neutral-200 font-orbitron text-sm">COMING SOON</span>
                    </button>
                  </a>
                </div>
              </div>

              <div class="bg-neutral-900/30 backdrop-blur-xl rounded-2xl border border-white/[0.05] p-8"
                data-aos="fade-left">
                <div class="flex items-center gap-4 mb-4">
                  <div class="relative w-10 h-10 flex items-center justify-center">
                    <div
                      class="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20 rounded-xl animate-gradient">
                    </div>
                    <div class="absolute inset-0 rounded-xl border border-white/10 backdrop-blur-sm"></div>
                    <svg class="relative w-6 h-6 text-purple-500" viewBox="0 0 24 24" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M5 8H19M5 8C3.89543 8 3 7.10457 3 6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6C21 7.10457 20.1046 8 19 8M5 8L5 18C5 19.1046 5.89543 20 7 20H17C18.1046 20 19 19.1046 19 18V8"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </div>
                  <h3 class="font-orbitron text-2xl text-white">Stash Box</h3>
                </div>
                <ul class="space-y-3 text-neutral-300 font-exo">
                  <li class="flex items-center gap-3">
                    <span class="text-sky-500 text-xl">•</span>
                    <span
                      class="bg-neutral-800 hover:bg-neutral-700/50 cursor-pointer select-none transition-all duration-300 rounded px-1 py-0.5">
                      <span class="text-transparent hover:text-neutral-300/30 transition-all duration-300">
                        [REDACTED]
                      </span>
                    </span>
                  </li>
                </ul>
                <div class="mt-8">
                  <div
                    class="group relative px-4 py-3 bg-neutral-900/50 rounded-xl transition-all duration-300 opacity-50 cursor-not-allowed">
                    <div
                      class="absolute inset-0 bg-purple-500/10 rounded-xl blur-md group-hover:bg-purple-500/20 transition-all duration-300">
                    </div>
                    <button class="relative flex items-center justify-center w-full gap-3" disabled>
                      <svg class="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                          stroke-linejoin="round" />
                      </svg>
                      <span class="text-neutral-200 font-orbitron text-sm">COMING SOON</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div> -->

          <!-- CEX Section -->
          <!-- <div class="relative">
            <div class="flex items-center justify-center mb-4">
              <div class="relative w-12 h-12 flex items-center justify-center z-10 bg-neutral-950/80 rounded-full">
                <div class="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 rounded-full blur-xl">
                </div>
                <svg class="relative w-8 h-8 text-sky-500" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 8H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                  <path d="M2 16H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                  <path d="M6 4L18 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                  <path d="M18 4L6 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                  <circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </div>
            </div> -->
            <!-- <div class="bg-neutral-900/30 backdrop-blur-xl rounded-2xl border border-white/[0.05] p-8 md:col-span-2"
              data-aos="fade-up">
              <div class="flex items-center gap-4 mb-4">
                <div class="relative w-10 h-10 flex items-center justify-center">
                  <div
                    class="absolute inset-0 bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-purple-500/20 rounded-xl animate-gradient">
                  </div>
                  <div class="absolute inset-0 rounded-xl border border-white/10 backdrop-blur-sm"></div>
                  <svg class="relative w-6 h-6 text-sky-500" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 8H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                    <path d="M2 16H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                    <path d="M6 4L18 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                    <path d="M18 4L6 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                    <circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </div>
                <h3 class="font-orbitron text-2xl text-white">------</h3>
              </div>
              <div class="mt-8">
                <div
                  class="group relative px-4 py-3 bg-neutral-900/50 rounded-xl transition-all duration-300 opacity-50 cursor-not-allowed">
                  <div
                    class="absolute inset-0 bg-sky-500/10 rounded-xl blur-md group-hover:bg-sky-500/20 transition-all duration-300">
                  </div>
                  <button class="relative flex items-center justify-center w-full gap-3" disabled>
                    <svg class="w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                    </svg>
                    <span class="text-neutral-200 font-orbitron text-sm">COMING SOON</span>
                  </button>
                </div>
              </div>
            </div> -->
          <!-- </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backdrop-blur-xl {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Add smooth transitions for hover effects */
.bg-neutral-900\/30:hover {
  transform: translateY(-2px);
  transition: all 0.3s ease-in-out;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 8s ease infinite;
}
</style>