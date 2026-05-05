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
  <div class="relative">
    <!-- Background Effects -->
    <div class="absolute inset-0 bg-gradient-to-b from-neutral-900/80 to-neutral-950/80">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]">
      </div>
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl"></div>
      <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl"></div>
    </div>

    <div class="relative container mx-auto px-6 py-32 lg:pb-48">
      <!-- Section Title -->
      <div class="text-center mb-16">
        <p class="font-orbitron text-6xl font-semibold text-center pb-3 relative">
          <span class="text-white">
            <span class="text-white">ECOSYSTEM ERA</span>
          </span>
        </p>
      </div>

      <!-- Ecosystem Items Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Council Box -->
        <div class="bg-neutral-900/30 backdrop-blur-xl rounded-2xl border border-white/[0.05] p-8" data-aos="fade-up">
          <div class="flex flex-col items-center text-center">
            <div class="relative w-16 h-16 flex items-center justify-center mb-4">
              <div class="absolute inset-0 bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-purple-500/20 rounded-xl animate-gradient"></div>
              <div class="absolute inset-0 rounded-xl border border-white/10 backdrop-blur-sm"></div>
              <svg class="relative w-10 h-10 text-sky-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <h3 class="font-orbitron text-2xl text-white uppercase">Council</h3>
          </div>
        </div>

        <!-- Treasury Box -->
        <div class="bg-neutral-900/30 backdrop-blur-xl rounded-2xl border border-white/[0.05] p-8" data-aos="fade-up" data-aos-delay="100">
          <div class="flex flex-col items-center text-center">
            <div class="relative w-16 h-16 flex items-center justify-center mb-4">
              <div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20 rounded-xl animate-gradient"></div>
              <div class="absolute inset-0 rounded-xl border border-white/10 backdrop-blur-sm"></div>
              <svg class="relative w-10 h-10 text-indigo-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.59 13.41L13.42 20.58C13.2343 20.766 13.0137 20.9135 12.7709 21.0141C12.5281 21.1148 12.2678 21.1666 12.005 21.1666C11.7422 21.1666 11.4819 21.1148 11.2391 21.0141C10.9963 20.9135 10.7757 20.766 10.59 20.58L2 12V2H12L20.59 10.59C20.9625 10.9647 21.1716 11.4716 21.1716 12C21.1716 12.5284 20.9625 13.0353 20.59 13.41Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M7 7H7.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <h3 class="font-orbitron text-2xl text-white uppercase">Treasury</h3>
          </div>
        </div>

        <!-- Liquidity Box -->
        <div class="bg-neutral-900/30 backdrop-blur-xl rounded-2xl border border-white/[0.05] p-8" data-aos="fade-up" data-aos-delay="200">
          <div class="flex flex-col items-center text-center">
            <div class="relative w-16 h-16 flex items-center justify-center mb-4">
              <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-sky-500/20 to-blue-500/20 rounded-xl animate-gradient"></div>
              <div class="absolute inset-0 rounded-xl border border-white/10 backdrop-blur-sm"></div>
              <svg class="relative w-10 h-10 text-indigo-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" stroke-width="2" />
              </svg>
            </div>
            <h3 class="font-orbitron text-2xl text-white uppercase">Liquidity</h3>
          </div>
        </div>

        <!-- Apps Box -->
        <div class="bg-neutral-900/30 backdrop-blur-xl rounded-2xl border border-white/[0.05] p-8" data-aos="fade-up" data-aos-delay="300">
          <div class="flex flex-col items-center text-center">
            <div class="relative w-16 h-16 flex items-center justify-center mb-4">
              <div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-sky-500/20 rounded-xl animate-gradient"></div>
              <div class="absolute inset-0 rounded-xl border border-white/10 backdrop-blur-sm"></div>
              <svg class="relative w-10 h-10 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" />
                <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" stroke-width="2" />
                <path d="M9 9H9.01" stroke="currentColor" stroke-width="2" />
                <path d="M15 9H15.01" stroke="currentColor" stroke-width="2" />
              </svg>
            </div>
            <h3 class="font-orbitron text-2xl text-white uppercase">Apps</h3>
          </div>
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