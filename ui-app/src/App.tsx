import React from 'react';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { TextField } from '@fluentui/react/lib/TextField';
import { useBoolean } from '@fluentui/react-hooks';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import {
  Link,
  MessageBar,
  MessageBarType,
} from '@fluentui/react';
import {
  HashRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import { mergeStyleSets } from '@fluentui/react/lib/Styling';
import { getStorageValue, useLocalStorage, K8sToken, K8sNamespace } from './utils'
import PodList from './PodList';
import { VERSION } from './version';
import './App.css';



const classNames = mergeStyleSets({
  pageHeader: {
    width: '100vw',
    height: '68px',
    flex: '1 1 auto',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    boxShadow: '0 0px 6px 4px #999',
    marginBottom: '10px',
    position: 'relative',
  },
  logo : {
    width: '48px',
    height: '48px',
    marginLeft: '10px',
  },
  pageHeaderTitle: {
    marginLeft: '10px',
    fontSize : '32px'
  },
  links: {
    position: 'absolute',
    right: '30px',
    bottom: '10px'
  },
  versionLink : {
    fontSize : '12px'
  }
});

const dialogStyles = { main: { maxWidth: 1024, minWidth: 800 } };
const dialogContentProps = {
  type: DialogType.normal,
  title: 'Settings',
  closeButtonAriaLabel: 'Close',
};

declare global {
  interface Window {
    POD_NAMESPACE:any;
  }
}

const DEFAULT_NS = window.POD_NAMESPACE || '';



function App() {

  const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
  const [token, setToken] = useState(getStorageValue('K8S_TOKEN', ""));
  const [namespace, setNamespace] = useState(getStorageValue('K8S_NAMESPACE', DEFAULT_NS));
  const [persistentToken, setPersistentToken] = useLocalStorage("K8S_TOKEN", "");
  const [persistentNamespace, setPersistentNamespace] = useLocalStorage("K8S_NAMESPACE", DEFAULT_NS);

  const modalProps = useMemo(
    () => ({

      isBlocking: true,
      styles: dialogStyles,
    }),
    [],
  );


  
  useEffect( () => {
    if( !persistentToken && !persistentNamespace ) {
      toggleHideDialog();
    }
  }, [toggleHideDialog]);
  

  const handleTokenChange = (e : any, value : string | undefined) => {
    setToken(value || "");
  };
  const handleNamespaceChange = (e : any, value : string | undefined) => {
    setNamespace(value || "");
  };

  const saveSettings = useCallback( () => {
    setPersistentToken(token);
    setPersistentNamespace(namespace);
    toggleHideDialog();
  }, [token, namespace, toggleHideDialog, setPersistentToken, setPersistentNamespace]);

  return (

      <Router>
        <div className={classNames.pageHeader}>
          <img src="/favicon.png" className={classNames.logo} alt="K8S Logo" />
          <div className={classNames.pageHeaderTitle}>Kubernetes Pod Inspector  <Link className={classNames.versionLink} href="https://github.com/wangjia184/pod-inspector" target="_blank">{VERSION}</Link></div>
          <div className={classNames.links}>Namespace : &#160; 
            <Link onClick={toggleHideDialog}>
              {namespace ? namespace : 'default' }
            </Link>
          </div>
        </div>

        <K8sToken.Provider value={token}>
          <K8sNamespace.Provider value={namespace}>
            <Switch>
              <Route path="/" component={PodList} />
            </Switch>
          </K8sNamespace.Provider>
        </K8sToken.Provider>
      
        <Dialog
          hidden={hideDialog}
          onDismiss={toggleHideDialog}
          dialogContentProps={dialogContentProps}
          modalProps={modalProps}
        >
          <form>
          <TextField label="Token" placeholder="Blank to use in-cluster token" value={token} onChange={handleTokenChange} />
          <MessageBar
            messageBarType={MessageBarType.warning}
            isMultiline={true} 
            dismissButtonAriaLabel="Close"
            truncated={false}
            overflowButtonAriaLabel="See more"
          >
            Token can be found in <code>~/.kube/config</code> file generated by kubectl. If token is not supplied here, K8S Pod Inspector will try to use the in-cluster token assigned by its service account. 
            By default service account does not have permission to access Kubernetes API. You have to grant proper role to service account.
          </MessageBar>

          <TextField label="Namespace" placeholder="Blank to access default namespace" value={namespace} onChange={handleNamespaceChange} />
          </form>
          <DialogFooter>
            <PrimaryButton onClick={saveSettings} text="Ok" />
            <DefaultButton onClick={toggleHideDialog} text="Cancel" />
          </DialogFooter>
        </Dialog>
      </Router>

  );
}





export default App;
