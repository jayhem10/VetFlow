import { create } from 'zustand'
import type { Step1FormData, Step2FormData, Step3FormData, Step4FormData } from '@/schemas/auth.schema'

export type RegistrationData = {
  step1?: Step1FormData
  step2?: Step2FormData
  step3?: Step3FormData
  step4?: Step4FormData
}

interface RegistrationStore {
  data: RegistrationData
  setStepData: (step: keyof RegistrationData, data: any) => void
  reset: () => void
}

export const useRegistrationStore = create<RegistrationStore>((set) => ({
  data: {},
  setStepData: (step, data) => set((state) => ({
    data: { ...state.data, [step]: data }
  })),
  reset: () => set({ data: {} }),
})) 