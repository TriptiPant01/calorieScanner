import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadingOverlay } from '@/components/loading-overlay';
import { CalorieSummary } from '@/components/dashboard/calorie-summary';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { HistoryCard } from '@/components/dashboard/history-card';
import { MacroBar } from '@/components/dashboard/macro-bar';
import { TodaysMeals } from '@/components/dashboard/todays-meals';
import { BottomTabInset, BrandColors, Spacing } from '@/constants/theme';
import { DailyGoals } from '@/constants/nutrition';
import { useFoodLogs } from '@/hooks/use-food-logs';
import { useProfile } from '@/hooks/use-profile';
import { useSession } from '@/hooks/use-session';
import { localDayKey, sumFoodLogs } from '@/lib/meals';

export default function DashboardScreen() {
  const { session } = useSession();
  const { profile, loading: profileLoading } = useProfile();
  const { logs, loading, error } = useFoodLogs(7);

  const metadata = session?.user.user_metadata;
  const name: string =
    profile?.fullName.trim() ||
    metadata?.full_name ||
    session?.user.email?.split('@')[0] ||
    'there';

  const todayKey = localDayKey(new Date());
  const todayLogs = logs.filter((log) => localDayKey(log.created_at) === todayKey);
  const consumed = sumFoodLogs(todayLogs);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <DashboardHeader name={name} />
          <CalorieSummary consumed={consumed.calories} goal={DailyGoals.calories} />
          <View style={styles.macroRow}>
            <MacroBar label="Protein" consumed={consumed.protein} goal={DailyGoals.protein} />
            <MacroBar label="Carbs" consumed={consumed.carbs} goal={DailyGoals.carbs} />
            <MacroBar label="Fat" consumed={consumed.fat} goal={DailyGoals.fat} />
          </View>
          <TodaysMeals logs={todayLogs} loading={loading} error={error} />
          <HistoryCard logs={logs} todayKey={todayKey} />
        </ScrollView>
      </SafeAreaView>
      <LoadingOverlay visible={loading || profileLoading} message="Loading your data..." />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  macroRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
});
