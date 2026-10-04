import { useEffect, useState } from "react";
import { Alert } from "react-native";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { totals, type LedgerRecord } from "@budget/contracts";
import { listRecords, pendingCount, SyncConflict, acceptRemote, keepLocal } from "../infrastructure/ledger";
import { today, type Tab } from "../utils/budget";
export function useHouseholdBudget() {
    const [records, setRecords] = useState<LedgerRecord[]>([]);
    const [month, setMonth] = useState(today().slice(0, 7));
    const [tab, setTab] = useState<Tab>("Overview");
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [date, setDate] = useState(today());
    const [categoryId, setCategoryId] = useState("");
    const [name, setName] = useState("");
    const [editing, setEditing] = useState<LedgerRecord>();
    const [budgetId, setBudgetId] = useState("");
    const [url, setUrl] = useState("");
    const [token, setToken] = useState("");
    const [pending, setPending] = useState(0);
    const [loading, setLoading] = useState(true);
    const [working, setWorking] = useState(false);
    const [status, setStatus] = useState("Saved on this phone");
    const refresh = async () => {
        setRecords(await listRecords());
        setPending(await pendingCount());
    };
    useEffect(() => {
        (async () => {
            try {
                await refresh();
                setUrl((await SecureStore.getItemAsync("server-url")) ?? "");
                setToken((await SecureStore.getItemAsync("server-token")) ?? "");
            }
            catch (e) {
                Alert.alert("Unable to load", String(e));
            }
            finally {
                setLoading(false);
            }
        })();
    }, []);
    const run = async (action: () => Promise<void>) => {
        if (working)
            return;
        setWorking(true);
        try {
            await action();
            await refresh();
        }
        catch (e) {
            if (e instanceof SyncConflict) {
                setStatus("Conflict needs your decision");
                const local = records.find((r) => r.id === e.remote.id);
                Alert.alert("Conflicting edit", `Your edit: ${local ? JSON.stringify(local) : "local record"}\nOther device: ${JSON.stringify(e.remote)}`, [
                    { text: "Decide later", style: "cancel" },
                    {
                        text: "Use other device",
                        onPress: () => void run(async () => {
                            await acceptRemote(e.remote);
                            setStatus("Conflict resolved. Sync again.");
                        }),
                    },
                    {
                        text: "Keep my edit",
                        onPress: () => void run(async () => {
                            await keepLocal(e.remote);
                            setStatus("Local edit ready. Sync again.");
                        }),
                    },
                ]);
            }
            else {
                setStatus("Action failed; local data preserved");
                Alert.alert("Could not complete", e instanceof Error ? e.message : String(e));
            }
        }
        finally {
            setWorking(false);
        }
    };
    const categories = records.filter((r): r is Extract<LedgerRecord, {
        kind: "category";
    }> => r.kind === "category");
    const active = categories.filter((r) => !r.archived);
    const budgets = records.filter((r): r is Extract<LedgerRecord, {
        kind: "budget";
    }> => r.kind === "budget" && r.month === month);
    const expenses = records.filter((r): r is Extract<LedgerRecord, {
        kind: "expense";
    }> => r.kind === "expense" && r.month === month && !r.voided);
    const income = records.filter((r): r is Extract<LedgerRecord, {
        kind: "income";
    }> => r.kind === "income" && r.month === month);
    const summary = totals(records, month);
    const reset = () => {
        setAmount("");
        setNote("");
        setName("");
        setEditing(undefined);
        setBudgetId("");
        setCategoryId("");
        setDate(today());
    };
    const base = () => ({
        id: editing?.id ?? Crypto.randomUUID(),
        revision: editing?.revision ?? 0,
    });
    return { records, month, setMonth, tab, setTab, amount, setAmount, note, setNote, date, setDate, categoryId, setCategoryId, name, setName, editing, setEditing, budgetId, setBudgetId, url, setUrl, token, setToken, pending, loading, working, status, setStatus, run, categories, active, budgets, expenses, income, summary, reset, base };
}
export type HouseholdBudgetController = ReturnType<typeof useHouseholdBudget>;
