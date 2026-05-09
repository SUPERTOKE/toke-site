<script setup>
import { onMounted, ref } from 'vue';
import AOS from 'aos'
import 'aos/dist/aos.css'

onMounted(async () => {
    AOS.init();
});

</script>

<template>
    <!-- Add a container with relative positioning for the folder effect -->
    <div class="relative">
        <!-- Folder tab effect - adjust styling -->
        <div class="absolute -top-16 left-0 md:right-auto md:left-8 h-16 bg-neutral-900/90 backdrop-blur-md
                    rounded-t-2xl border-t border-l border-r border-white/[0.05] px-6 
                    [border-bottom:none] z-10">
            <div class="relative">
                <!-- Background bubbles for the text -->
                <div class="absolute -top-8 right-12 w-32 h-32 bg-purple-500/20 rounded-full filter blur-3xl"></div>
                <div class="absolute -bottom-8 left-12 w-32 h-32 bg-blue-500/20 rounded-full filter blur-3xl"></div>
                
                <!-- Text with gradient clip mask -->
                <div class="flex items-center justify-center gap-4">
                    <p class="font-orbitron text-3xl sm:text-5xl md:text-6xl font-semibold text-start md:text-center pt-1 relative leading-tight">
                        <span class="text-white">G<span class="text-2xl sm:text-4xl md:text-5xl">ENESIS</span> E<span class="text-2xl sm:text-4xl md:text-5xl">RA</span></span>
                    </p>
                    <div class="relative w-12 h-12 flex items-center justify-center hidden md:flex">
                        <div class="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 rounded-full blur-xl"></div>
                        <svg class="relative w-8 h-8 text-sky-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <!-- Circuit board inspired design -->
                            <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" 
                                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M9 9h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M15 9h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M9 15h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M15 15h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path class="animate-pulse" d="M9 9h6M9 15h6M9 9v6M15 9v6" 
                                  stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="9" cy="9" r="1" fill="currentColor"/>
                            <circle cx="15" cy="9" r="1" fill="currentColor"/>
                            <circle cx="9" cy="15" r="1" fill="currentColor"/>
                            <circle cx="15" cy="15" r="1" fill="currentColor"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Main content panel (surface only — page gradient lives on Home.vue) -->
        <div class="bg-neutral-900/35 backdrop-blur-md relative overflow-hidden 
                    border border-white/[0.05] md:rounded-tr-3xl rounded-tl-md rounded-b-3xl pb-24">
            <div class="relative container mx-auto px-4 sm:px-6 py-20 md:py-24 lg:py-24">
                <div class="grid lg:grid-cols-3 gap-12">
                    <!-- Tokenomics Card -->
                    <div class="group bg-neutral-900/30 backdrop-blur-xl rounded-2xl border border-white/[0.05] 
                                transform hover:scale-[1.02] transition-all duration-300 flex flex-col h-full"
                        data-aos="fade-up">
                        <!-- Card Header -->
                        <div class="p-8 pb-4">
                            <div class="flex items-center justify-between mb-6">
                                <p class="font-orbitron text-2xl uppercase text-white">Tokenomics</p>
                                <div class="relative w-12 h-12 flex items-center justify-center">
                                    <div class="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 rounded-full blur-xl"></div>
                                    <svg class="relative w-8 h-8 text-sky-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                            
                            <!-- Card Content -->
                            <div class="text-neutral-400 font-exo tracking-wide text-lg space-y-4">
                                <p data-aos="fade-in" data-aos-duration="1000" data-aos-delay="300" class="flex items-center gap-3">
                                    <span class="text-sky-500 text-2xl leading-none">•</span> 
                                    <span><span class="text-white font-semibold">6/22/2023</span> Mint Date</span>
                                </p>
                                <p data-aos="fade-in" data-aos-duration="1000" data-aos-delay="300" class="flex items-center gap-3">
                                    <span class="text-sky-500 text-2xl leading-none">•</span> 
                                    <span><span class="text-white font-semibold">420,000,069</span> Max Supply</span>
                                </p>
                                <p data-aos="fade-in" data-aos-duration="1000" data-aos-delay="400" class="flex items-center gap-3">
                                    <span class="text-sky-500 text-2xl leading-none">•</span> 
                                    <span><span class="text-white font-semibold">100%</span> Supply Airdropped</span>
                                </p>
                                <p data-aos="fade-in" data-aos-duration="1000" data-aos-delay="500" class="flex items-center gap-3">
                                    <span class="text-sky-500 text-2xl leading-none">•</span> 
                                    <span><span class="text-white font-semibold">0%</span> Team Allocation</span>
                                </p>
                            </div>
                        </div>

                        <!-- Card Footer - Standardized Button Container -->
                        <div class="mt-auto py-8 px-5 pt-4">
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                <a href="https://solscan.io/token/AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo" target="_blank"
                                    class="group relative px-4 py-3 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-xl transition-all duration-300">
                                    <div class="absolute inset-0 bg-sky-500/10 rounded-xl blur-md group-hover:bg-sky-500/20 transition-all duration-300"></div>
                                    <button class="relative flex items-center justify-center w-full">
                                        <img src="../../assets/logos/trade/solscan.png" alt="Solscan" class="w-5 h-5 object-contain">
                                    </button>
                                </a>
                                <a href="https://coinmarketcap.com/currencies/mctoken/" target="_blank"
                                    class="group relative px-4 py-3 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-xl transition-all duration-300">
                                    <div class="absolute inset-0 bg-indigo-500/10 rounded-xl blur-md group-hover:bg-indigo-500/20 transition-all duration-300"></div>
                                    <button class="relative flex items-center justify-center w-full">
                                        <img src="../../assets/logos/trade/cmc.png" alt="CoinMarketCap" class="w-5 h-5 object-contain">
                                    </button>
                                </a>
                                <!-- <a href="https://jup.ag/swap/SOL-AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo" target="_blank"
                                    class="group relative px-4 py-3 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-xl transition-all duration-300">
                                    <div class="absolute inset-0 bg-purple-500/10 rounded-xl blur-md group-hover:bg-purple-500/20 transition-all duration-300"></div>
                                    <button class="relative flex items-center justify-center w-full">
                                        <img src="../../assets/logos/trade/jup.png" alt="Jupiter" class="w-5 h-5 object-contain">
                                    </button>
                                </a> -->
                            </div>
                        </div>
                    </div>

                    <!-- Community Card -->
                    <div class="group bg-neutral-900/30 backdrop-blur-xl rounded-2xl border border-white/[0.05] 
                                transform hover:scale-[1.02] transition-all duration-300 flex flex-col h-full"
                        data-aos="fade-up" data-aos-delay="200">
                        <!-- Card Header -->
                        <div class="p-8 pb-4">
                            <div class="flex items-center justify-between mb-6">
                                <p class="font-orbitron text-2xl uppercase text-white">Community</p>
                                <div class="relative w-12 h-12 flex items-center justify-center">
                                    <div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-xl"></div>
                                    <svg class="relative w-8 h-8 text-purple-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                            
                            <!-- Card Content -->
                            <div class="text-neutral-300 font-exo text-lg space-y-4">
                                <p data-aos="fade-in" data-aos-duration="1000" data-aos-delay="300" class="flex items-center gap-3">
                                    <span class="text-sky-500 text-xl leading-none">•</span> 
                                    <span><span class="text-white font-semibold">$TOKE holders are the community</span></span>
                                </p>
                                <p data-aos="fade-in" data-aos-duration="1000" data-aos-delay="400" class="flex items-center gap-3">
                                    <span class="text-sky-500 text-xl leading-none">•</span> 
                                    <span><span class="text-white font-semibold">McTokers provide liquidity via LPs</span></span>
                                </p>
                                <p data-aos="fade-in" data-aos-duration="1000" data-aos-delay="500" class="flex items-center gap-3">
                                    <span class="text-sky-500 text-xl leading-none">•</span> 
                                    <span><span class="text-white font-semibold">McWhales ensure waters stay safe</span></span>
                                </p>
                                <p data-aos="fade-in" data-aos-duration="1000" data-aos-delay="600" class="flex items-center gap-3">
                                    <span class="text-sky-500 text-xl leading-none">•</span> 
                                    <span><span class="text-white font-semibold">McVoters control the treasury</span></span>
                                </p>
                            </div>
                        </div>

                        <!-- Card Footer - Standardized Button Container -->
                        <div class="mt-auto p-8 pt-4">
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                <a href="https://verified.jup.ag/dashboard/AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo" target="_blank"
                                    class="group relative px-4 py-3 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-xl transition-all duration-300">
                                    <div class="absolute inset-0 bg-neutral-600/10 rounded-xl blur-md group-hover:bg-neutral-600/20 transition-all duration-300"></div>
                                    <button class="relative flex items-center justify-center w-full">
                                        <svg class="w-5 h-5 text-neutral-200" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                        </svg>
                                    </button>
                                </a>
                                <a href="https://discord.com/invite/gTYuUCthvC" target="_blank"
                                    class="group relative px-4 py-3 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-xl transition-all duration-300">
                                    <div class="absolute inset-0 bg-indigo-500/10 rounded-xl blur-md group-hover:bg-indigo-500/20 transition-all duration-300"></div>
                                    <button class="relative flex items-center justify-center w-full">
                                        <svg class="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.175 13.175 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
                                        </svg>
                                    </button>
                                </a>
                                <!-- <a href="https://t.me/tokecommunity" target="_blank"
                                    class="group relative px-4 py-3 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-xl transition-all duration-300">
                                    <div class="absolute inset-0 bg-sky-500/10 rounded-xl blur-md group-hover:bg-sky-500/20 transition-all duration-300"></div>
                                    <button class="relative flex items-center justify-center w-full">
                                        <svg class="w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                        </svg>
                                    </button>
                                </a> -->
                            </div>
                        </div>
                    </div>

                    <!-- McToken DAO Card -->
                    <div class="group bg-neutral-900/30 backdrop-blur-xl rounded-2xl border border-white/[0.05] 
                                transform hover:scale-[1.02] transition-all duration-300 flex flex-col h-full"
                        data-aos="fade-up" data-aos-delay="400">
                        <!-- Card Header -->
                        <div class="p-8 pb-4">
                            <div class="flex items-center justify-between mb-6">
                                <p class="font-orbitron text-2xl uppercase text-white">McVault</p>
                                <div class="relative w-12 h-12 flex items-center justify-center">
                                    <div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-xl"></div>
                                    <svg class="relative w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path class="animate-pulse" d="M7 12H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                            
                            <!-- Card Content -->
                            <div class="text-neutral-300 font-exo text-lg space-y-4">
                                <p data-aos="fade-in" data-aos-duration="1000" data-aos-delay="300" class="flex items-center gap-3">
                                    <span class="text-sky-500 text-xl leading-none">•</span> 
                                    <span><span class="text-white font-semibold">Idiot devs locked 7% of the supply</span></span>
                                </p>
                                <p data-aos="fade-in" data-aos-duration="1000" data-aos-delay="400" class="flex items-center gap-3">
                                    <span class="text-sky-500 text-xl leading-none">•</span> 
                                    <span><span class="text-white font-semibold">Annual Great McVotes shaped whether it opened</span></span>
                                </p>
                                <p data-aos="fade-in" data-aos-duration="1000" data-aos-delay="500" class="flex items-center gap-3">
                                    <span class="text-sky-500 text-xl leading-none">•</span> 
                                    <span><span class="text-white font-semibold">60% YES quorum was required to unlock</span></span>
                                </p>
                                <p data-aos="fade-in" data-aos-duration="1000" data-aos-delay="600" class="flex items-center gap-3">
                                    <span class="text-sky-500 text-xl leading-none">•</span> 
                                    <span><span class="text-white font-semibold">1 $TOKE = 1 McVote</span></span>
                                </p>
                                <p class="text-neutral-500 text-sm pt-2 font-exo leading-snug">
                                    The three-year arc lives below—then the vault, then whatever holders build next.
                                </p>
                            </div>
                        </div>

                        <!-- Card Footer - Standardized Button Container -->
                        <div class="mt-auto p-8 pt-4">
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                <a href="https://app.realms.today/dao/BEmzTQaiwyj69uvxmdL9fSEuETg9vsVrRDAkmDE1HWTD"
                                    target="_blank"
                                    class="group relative px-4 py-3 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-xl transition-all duration-300">
                                    <div class="absolute inset-0 bg-indigo-500/10 rounded-xl blur-md group-hover:bg-indigo-500/20 transition-all duration-300"></div>
                                    <button class="relative flex items-center justify-center w-full">
                                        <img src="../../assets/logos/trade/realms.png" alt="Realms" class="w-5 h-5 object-contain">
                                    </button>
                                </a>
                                <!-- <a href="https://app.realms.today/dao/BEmzTQaiwyj69uvxmdL9fSEuETg9vsVrRDAkmDE1HWTD"
                                    target="_blank"
                                    class="group relative px-4 py-3 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-xl transition-all duration-300">
                                    <div class="absolute inset-0 bg-sky-500/10 rounded-xl blur-md group-hover:bg-sky-500/20 transition-all duration-300"></div>
                                    <button class="relative flex items-center justify-center w-full">
                                        <svg class="w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </button>
                                </a> -->
                                <!-- <div class="group relative px-4 py-3 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-xl transition-all duration-300 cursor-not-allowed">
                                    <div class="absolute inset-0 bg-purple-500/10 rounded-xl blur-md group-hover:bg-purple-500/20 transition-all duration-300"></div>
                                    <button class="relative flex items-center justify-center w-full" disabled>
                                        <svg class="w-5 h-5 text-purple-400 group-hover:hidden" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
                                                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                        <span class="text-neutral-200 font-orbitron text-xs hidden group-hover:block">SOON</span>
                                    </button>
                                </div> -->
                            </div>
                        </div>
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
.group {
    transition: all 0.3s ease-in-out;
}

/* Add hover effect for buttons */
button {
    transition: all 0.2s ease-in-out;
}

button:hover {
    transform: translateY(-1px);
}

.gradient-text {
    background: linear-gradient(to right, rgb(147, 197, 253), rgb(167, 139, 250));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    position: relative;
    z-index: 20;
    filter: drop-shadow(0 0 15px rgba(147, 197, 253, 0.3));
}
</style>
