"use client";
import { useWalletStore } from "./useWalletStore";

export function Wallet() {
  const { currentWallet } = useWalletStore();

  return (
    <div className="">
      {currentWallet !== null && (
        <>
          <div className="text-xl font-bold">
            {currentWallet === "" ? "default" : currentWallet}
          </div>
        </>
      )}
    </div>
  );
}
