import { isRootId } from '@/src/utils/app/id';

import { FeatureType } from '@/src/types/common';
import { DialFile } from '@/src/types/files';
import { FolderInterface } from '@/src/types/folder';
import { MappedReplaceActions } from '@/src/types/import-export';

import Folder from '../../Folder/Folder';
import { FilesRow } from './Components';
import { OnItemEvent } from './ReplaceConfirmationModal';

interface Props {
  folders: FolderInterface[];
  mappedActions: MappedReplaceActions;
  openedFoldersIds: string[];
  duplicatedFiles: DialFile[];
  handleToggleFolder: (folderId: string) => void;
  onItemEvent: OnItemEvent;
}
export const FilesList = ({
  folders,
  mappedActions,
  openedFoldersIds,
  duplicatedFiles,
  handleToggleFolder,
  onItemEvent,
}: Props) => {
  return (
    <>
      {folders.map((folder) => {
        if (!isRootId(folder.folderId)) {
          return null;
        }

        return (
          <div key={folder.id}>
            <Folder
              readonly
              searchTerm={''}
              currentFolder={folder}
              allFolders={folders}
              highlightedFolders={[]}
              isInitialRenameEnabled
              displayCaretAlways
              additionalItemData={{ mappedActions }}
              openedFoldersIds={openedFoldersIds}
              allItems={duplicatedFiles}
              itemComponent={FilesRow}
              onClickFolder={handleToggleFolder}
              onItemEvent={onItemEvent}
              withBorderHighlight={false}
              featureType={FeatureType.File}
              folderClassName="h-[38px]"
            />
          </div>
        );
      })}
      {duplicatedFiles.map((file) => {
        if (!isRootId(file.folderId)) {
          return null;
        }

        return (
          <div key={file.id}>
            <FilesRow
              item={file}
              onEvent={onItemEvent}
              additionalItemData={{ mappedActions }}
            />
          </div>
        );
      })}
    </>
  );
};
