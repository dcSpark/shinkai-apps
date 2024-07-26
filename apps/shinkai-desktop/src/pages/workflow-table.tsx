import { columns } from '../components/workflow/columns';
import DataTable from '../components/workflow/data-table';
import { topProductivityBooks } from '../components/workflow/workflow-data';
import { SubpageLayout } from './layout/simple-layout';

const WorkflowTable = () => {
  return (
    <SubpageLayout className="max-w-6xl px-3 pb-0" title={'Workflow AI Table'}>
      <DataTable columns={columns} data={topProductivityBooks} />
    </SubpageLayout>
  );
};
export default WorkflowTable;
