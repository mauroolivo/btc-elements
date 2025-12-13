"use client";
import { useState } from "react";
import { useWalletStore } from "./useWalletStore";

export function WalletConnect() {
  const [open, setOpen] = useState(false);
  const {
    listwalletdir,
    listwallets,
    listwalletdirFetch,
    listwalletsFetch,
    loading,
    connectWallet,
  } = useWalletStore();
  function toggleOpen() {
    if (!open) {
      console.log("Fetching wallet info");
      listwalletdirFetch();
      listwalletsFetch();
    }
    setOpen(!open);
  }
  function handleConnect(wallet: string) {
    connectWallet(wallet);
  }
  const names = listwalletdir.result.wallets.map((wallet) => wallet.name);
  return (
    <div className="">
      {open && (
        <>
          {" "}
          {names.map((name) => (
            <div
              key={name === "" ? "default" : name}
              className="text-xl font-bold"
            >
              {name === "" ? "default" : name}{" "}
              {listwallets.result.includes(name) ? (
                <button onClick={() => handleConnect(name)}>Connect</button>
              ) : (
                "(unloaded)"
              )}
            </div>
          ))}
          {/* <pre>{JSON.stringify(listwalletdir, null, 2)}</pre> */}
          {/* <pre>{JSON.stringify(listwallets, null, 2)}</pre> */}
        </>
      )}
      {loading && <p>Loading...</p>}
      {!loading && (
        <button onClick={toggleOpen} type="button">
          {open ? "Close Wallet Info" : "Open Wallet Info"}
        </button>
      )}
      {/* {userName ? (
        <>
          <span onClick={togglePermissions}>{userName} has signed in</span>
          <button type="button" onClick={handleSignOut} disabled={loading}>
            {loading ? "..." : "Sign out"}
          </button>
        </>
      ) : (
        <button type="button" onClick={handleSignIn} disabled={loading}>
          {loading ? "..." : "Sign in"}
        </button>
      )} */}
    </div>
  );
}
