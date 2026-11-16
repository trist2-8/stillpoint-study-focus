import {beforeEach,afterEach,describe,it,expect,vi} from "vitest";
import {defaults} from "../types";
const mocks=vi.hoisted(()=>({read:vi.fn(),rpc:vi.fn()}));
vi.mock("@supabase/supabase-js",()=>({createClient:()=>({from:()=>({select:()=>({maybeSingle:mocks.read})}),rpc:mocks.rpc})}));
beforeEach(()=>{vi.resetModules();vi.stubEnv("VITE_SUPABASE_URL","https://example.supabase.co");vi.stubEnv("VITE_SUPABASE_ANON_KEY","test-public-key");mocks.read.mockReset();mocks.rpc.mockReset();});
afterEach(()=>vi.unstubAllEnvs());
describe("cloud sync contract",()=>{
 it("keeps a new account empty until the user explicitly uploads",async()=>{mocks.read.mockResolvedValue({data:null,error:null});const cloud=await import("./cloud");expect(await cloud.readCloud()).toBeNull();expect(mocks.rpc).not.toHaveBeenCalled();});
 it("validates remote data before it can replace local data",async()=>{mocks.read.mockResolvedValue({data:{revision:3,payload:{settings:defaults,tasks:[{title:"broken"}],sessions:[]}},error:null});const cloud=await import("./cloud");await expect(cloud.readCloud()).rejects.toThrow();});
 it("uses an expected revision so a concurrent change is never silently overwritten",async()=>{mocks.rpc.mockResolvedValue({data:null,error:new Error("Cloud copy changed")});const cloud=await import("./cloud");const data={settings:defaults,tasks:[],sessions:[]};await expect(cloud.writeCloud(data,2)).rejects.toThrow("Cloud copy changed");expect(mocks.rpc).toHaveBeenCalledWith("save_study_backup",{document:data,expected_revision:2});});
 it("returns a validated remote payload and new revision on success",async()=>{const payload={settings:defaults,tasks:[],sessions:[]};mocks.read.mockResolvedValue({data:{revision:4,payload},error:null});mocks.rpc.mockResolvedValue({data:5,error:null});const cloud=await import("./cloud");expect(await cloud.readCloud()).toMatchObject({revision:4,payload});expect(await cloud.writeCloud(payload,4)).toBe(5);});
});
