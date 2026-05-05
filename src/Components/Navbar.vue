<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'
import { WalletMultiButton, useWallet } from 'solana-wallets-vue'
import axios from 'axios'

const tokePrice = ref(null)
const isNavbarVisible = ref(true)
let lastScrollPosition = 0
const isMenuOpen = ref(false)
const menuRef = ref(null)
const buttonRef = ref(null)

onMounted(async () => {
    try {
        // console.log('Fetching $TOKE price...');
        const response = await axios.get('https://tokebackend-production-d07f.up.railway.app/token-price', {
            params: {
                ids: 'AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo',
                vsToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
            }
        });
        // console.log('API Response:', response.data);
        
        const tokeData = response.data.data['AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo'];
        // console.log('Toke Data:', tokeData);
        
        if (tokeData && tokeData.price) {
            const priceNumber = parseFloat(tokeData.price);
            tokePrice.value = `$${priceNumber.toFixed(6)}`;
            // console.log('Final formatted price:', tokePrice.value);
        } else {
            console.log('No price data found in response');
            tokePrice.value = '$0.000000';
        }
    } catch (error) {
        console.error('Error fetching $TOKE price:', error);
        console.error('Error details:', error.response?.data || error.message);
        tokePrice.value = '$0.000000';
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside, { passive: true })
});

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside)
    document.removeEventListener('touchstart', handleClickOutside)
})

const handleScroll = () => {
    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop
    if (currentScrollPosition < 0) {
        return
    }
    // Show navbar if scrolling up or at the top
    if (currentScrollPosition < lastScrollPosition || currentScrollPosition < 50) {
        isNavbarVisible.value = true
    } else {
        isNavbarVisible.value = false
    }
    lastScrollPosition = currentScrollPosition
}

const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
        const navbarHeight = 42;
        const sectionPosition = section.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
        window.scrollTo({ top: sectionPosition, behavior: 'smooth' });
    }
};

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
}

const handleNavClick = (sectionId) => {
    scrollToSection(sectionId);
    isMenuOpen.value = false; // Close mobile menu after clicking
};

const handleClickOutside = (event) => {
    // Remove preventDefault to allow scrolling
    const target = event.type === 'touchstart' ? event.touches[0].target : event.target;
    
    if (isMenuOpen.value && 
        menuRef.value && 
        buttonRef.value && 
        !menuRef.value.contains(target) && 
        !buttonRef.value.contains(target)) {
        isMenuOpen.value = false;
    }
};
</script>

<template>
    <div class="fixed top-0 left-0 right-0 bg-neutral-900/30 font-orbitron px-2 md:px-10 z-50 text-neutral-300 transition-all duration-300 backdrop-blur-xl h-16 flex items-center justify-between"
         :class="{ 'translate-y-0': isNavbarVisible, '-translate-y-full': !isNavbarVisible }">
        <!-- Background decoration -->
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
        <div class="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent"></div>
        
        <!-- Left Section -->
        <div class="flex items-center">
            <!-- Mobile Menu -->
            <div class="relative xl:hidden pr-1 md:pr-0">
                <button ref="buttonRef"
                        @click.stop="toggleMenu" 
                        class="p-2 hover:bg-white/5 rounded-xl transition-all duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h8m-8 6h16" />
                    </svg>
                </button>
                
                <div ref="menuRef"
                     v-show="isMenuOpen"
                     class="absolute top-full left-0 mt-3 z-50 p-4 shadow-xl 
                            bg-gradient-to-b from-neutral-900 to-neutral-950
                            rounded-2xl w-72 
                            border border-white/[0.05] transform transition-all duration-300
                            max-h-[80vh] overflow-y-auto">
                    <!-- Background Effects -->
                    <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
                    <div class="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/5 rounded-full filter blur-3xl"></div>
                    <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/5 rounded-full filter blur-3xl"></div>

                    <!-- Close Button -->
                    <button @click="isMenuOpen = false"
                            class="absolute top-3 right-3 p-1.5 hover:bg-white/[0.05] rounded-lg transition-all duration-200">
                        <svg class="w-4 h-4 text-neutral-400 hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <!-- Menu Header -->
                    <div class="mb-4 pb-4 border-b border-white/[0.05]">
                        <p class="font-orbitron text-lg text-white">Navigation</p>
                    </div>
                    
                    <!-- Menu Items -->
                    <div class="space-y-2">
                        <button @click="handleNavClick('Genesis')" 
                                class="flex items-center gap-3 p-3 hover:bg-white/[0.05] rounded-xl transition-all duration-200 w-full">
                            <svg class="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                            <span class="font-orbitron text-neutral-200">Genesis Era</span>
                        </button>
                        
                        <button @click="handleNavClick('Timeline')" 
                                class="flex items-center gap-3 p-3 hover:bg-white/[0.05] rounded-xl transition-all duration-200 w-full">
                            <svg class="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                            </svg>
                            <span class="font-orbitron text-neutral-200">
                                <span>Ecosystem Era</span>
                            </span>
                        </button>
                        
                        <button @click="handleNavClick('Redacted')" 
                                class="flex items-center gap-3 p-3 hover:bg-white/[0.05] rounded-xl transition-all duration-200 w-full group">
                            <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                            <span class="font-orbitron text-neutral-200">
                                <span class="relative inline-block">
                                    <span class="absolute inset-0 bg-neutral-800 border border-neutral-700 rounded px-1 group-hover:bg-transparent group-hover:border-transparent transition-all duration-300"></span>
                                    <span class="relative text-neutral-800 group-hover:text-neutral-200 transition-colors duration-300">???</span>
                                </span>
                                <span> Era</span>
                            </span>
                        </button>

                        <button @click="handleNavClick('Utility')" 
                                class="flex items-center gap-3 p-3 hover:bg-white/[0.05] rounded-xl transition-all duration-200 w-full">
                            <svg class="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                            <span class="font-orbitron text-neutral-200">Utility</span>
                        </button>
                    </div>

                    <!-- Social Links -->
                    <div class="mt-6 pt-4 border-t border-white/[0.05]">
                        <div class="flex items-center justify-around">
                            <a href="https://twitter.com/TokeCommunity" target="_blank" 
                               class="p-3 hover:bg-white/[0.05] rounded-xl transition-all duration-200">
                                <img src="../assets/x.png" class="h-5 invert" />
                            </a>
                            <a href="https://discord.gg/mMTvzr8x" target="_blank"
                               class="p-3 hover:bg-white/[0.05] rounded-xl transition-all duration-200">
                                <img src="../assets/discord.webp" class="h-5" />
                            </a>
                            <a href="https://t.me/tokecommunity" target="_blank"
                               class="p-3 hover:bg-white/[0.05] rounded-xl transition-all duration-200">
                                <img src="../assets/tg.png" class="h-4 invert" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Logo and Brand -->
            <div class="flex items-center space-x-4">
                <img src="../assets/logo.png" class="h-9 rounded-full hover:scale-105 transition-transform duration-300" />
                <div class="h-8 w-px bg-gradient-to-b from-transparent via-neutral-700 to-transparent hidden md:block"></div>
                <div class="hidden md:flex flex-col">
                    <p class="text-xl tracking-wider text-white">$TOKE</p>
                    <p class="text-xs tracking-wider -mt-1 text-neutral-400">McToken</p>
                </div>
            </div>
        </div>

        <!-- Center Section -->
        <div class="hidden xl:flex items-center justify-center relative z-10 pl-32">
            <div class="flex items-center space-x-6">
                <button @click="handleNavClick('Genesis')" 
                        class="cursor-pointer px-4 py-2 hover:bg-white/[0.05] rounded-xl transition-all duration-200 relative">
                    Genesis Era
                </button>
                <button @click="handleNavClick('Timeline')" 
                        class="cursor-pointer px-4 py-2 hover:bg-white/[0.05] rounded-xl transition-all duration-200 relative">
                    <span class="text-neutral-300">Ecosystem Era</span>
                </button>
                <button @click="handleNavClick('Redacted')" 
                        class="cursor-pointer px-4 py-2 hover:bg-white/[0.05] rounded-xl transition-all duration-200 relative group">
                    <span class="text-neutral-300">
                        <span class="relative inline-block">
                            <span class="absolute inset-0 bg-neutral-800 border border-neutral-700 rounded px-1 group-hover:bg-transparent group-hover:border-transparent transition-all duration-300"></span>
                            <span class="relative text-neutral-800 group-hover:text-neutral-300 transition-colors duration-300">???</span>
                        </span>
                        <span> Era</span>
                    </span>
                </button>

                <button @click="handleNavClick('Utility')" 
                        class="cursor-pointer px-4 py-2 hover:bg-white/[0.05] rounded-xl transition-all duration-200 relative">
                    Utility
                </button>
            </div>
        </div>

        <!-- Right Section -->
        <div class="flex items-center space-x-1 md:space-x-3">
            <div class="flex items-center space-x-2 bg-neutral-900/30 border border-white/[0.05] p-3 rounded-xl hover:bg-white/[0.03] transition-all duration-200">
                <img src="../assets/solana.png" class="h-4" />
                <p class="text-sm">$TOKE: <span class="font-opensans font-bold text-[16px]">{{ tokePrice }}</span></p>
            </div>
            <!-- <div>
                <wallet-multi-button dark></wallet-multi-button>
            </div> -->
        </div>
    </div>
</template>

<style scoped>
.backdrop-blur-xl {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}
</style>
