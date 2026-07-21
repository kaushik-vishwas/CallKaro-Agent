import {PageHeader} from '../../components/layout/PageHeader/PageHeader';
import {Card} from '../../components/ui';
import styles from './PlaceholderPage.module.css';

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({title, description}: PlaceholderPageProps) {
  return (
    <div className={styles.page}>
      <PageHeader title={title} subtitle={description} />
      <Card className={styles.card}>
        <p className={styles.copy}>
          This screen is scaffolded and ready for features. Reuse shared UI
          components from <code>src/components/ui</code>.
        </p>
      </Card>
    </div>
  );
}
