"use client"

import { cn } from "@/lib/utils";
import {
  IconCoin,
  IconLock,
  IconChartLine,
  IconWallet,
  IconCode,
  IconChartDots3,
  IconShieldLock,
  IconActivityHeartbeat,
} from "@tabler/icons-react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import Image from "next/image";

export default function FeaturesSection() {
  const features = [
    {
      title: "Decentralized Trading",
      description: "Experience the freedom of secure, peer-to-peer options trading.",
      icon: <IconCoin />,
    },
    {
      title: "Wallet Integration",
      description: "Easily connect with MetaMask, WalletConnect, and more.",
      icon: <IconWallet />,
    },
    {
      title: "Real-Time Analytics",
      description: "Access live data and insights to make informed trading decisions.",
      icon: <IconChartLine />,
    },
    {
      title: "Smart Contract Security",
      description: "Your trades are backed by secure and audited smart contracts.",
      icon: <IconLock />,
    },
    {
      title: "Customizable Options",
      description: "Tailor your options contracts to fit your trading strategy.",
      icon: <IconCode />,
    },
    {
      title: "Market Transparency",
      description: "All transactions are recorded on-chain for full transparency.",
      icon: <IconChartDots3 />,
    },
    {
      title: "24/7 Reliability",
      description: "Trade anytime with our robust and highly available platform.",
      icon: <IconShieldLock />,
    },
    {
      title: "Cutting-Edge Innovation",
      description: "We’re constantly improving to bring you the best trading experience.",
      icon: <IconActivityHeartbeat />,
    },
  ];
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <Feature key={feature.title} {...feature} index={index} />
        ))}
      </div>
      <div className="flex flex-col overflow-hidden">
          <ContainerScroll
            titleComponent={
              <>
                <h1 className="text-4xl font-semibold text-black dark:text-white">
                  Decentralized trading <br />
                  <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                    Unlimited Potential
                  </span>
                </h1>
              </>
            }
          >
            <Image
              src={`/image.png`}
              alt="hero"
              height={720}
              width={1400}
              className="mx-auto rounded-2xl object-cover h-full object-left-top"
              draggable={false}
            />
          </ContainerScroll>
        </div>
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-red-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
