<?php
/*
 |--------------------------------------------------------------------------
 | SkyCaiji (蓝天采集器)
 |--------------------------------------------------------------------------
 | Copyright (c) 2018 http://www.skycaiji.com All rights reserved.
 |--------------------------------------------------------------------------
 | 使用协议  http://www.skycaiji.com/licenses
 |--------------------------------------------------------------------------
 */

namespace skycaiji\install\event;
use skycaiji\common\controller\BaseController;
/*数据库升级操作*/
class UpgradeDb extends BaseController{
	/*后台更新时升级入口：当所有更新文件下载替换完毕，最后需要升级数据库*/
	public function run(){
		clear_dir(config('root_path').'/runtime');
		$url=url('Install/upgrade/admin',null,true,true);
		header('Location:'.$url);
		exit();
	}
	/*正常的升级入口*/
	public function upgrade(){
		set_time_limit(0);
		clear_dir(config('root_path').'/runtime');
		load_data_config();
		$result=$this->execute_upgrade();
		if($result['success']){
			$mconfig=model('admin/Config');
			$mconfig->setVersion($this->get_skycaiji_version());
		}
		return $result;
	}
	/*获取版本号*/
	public function get_skycaiji_version(){
		$newProgramConfig=file_get_contents(config('app_path').'/common.php');
		if(preg_match('/[\'\"]SKYCAIJI_VERSION[\'\"]\s*,\s*[\'\"](?P<v>[\d\.]+?)[\'\"]/i', $newProgramConfig,$programVersion)){
			$programVersion=$programVersion['v'];
		}else{
			$programVersion='';
		}
		return $programVersion;
	}
	/*判断存在索引*/
	public function check_exists_index($name,$indexs){
		if(empty($name)){
			return false;
		}
		$exists_index=false;
		foreach ($indexs as $k=>$v){
			if(strcasecmp($name,$v['key_name'])==0){
				$exists_index=true;
				break;
			}
		}
		return $exists_index;
	}
	/*判断存在字段*/
	public function check_exists_field($name,$columns){
		if(empty($name)){
			return false;
		}
		$exists_column=false;
		foreach ($columns as $k=>$v){
			if(strcasecmp($name,$v['field'])==0){
				$exists_column=true;
				break;
			}
		}
		return $exists_column;
	}
	/*修改字段类型*/
	public function modify_field_type($field,$type,$modifySql,$columns){
		foreach ($columns as $v){
			if(strcasecmp($field,$v['field'])==0){
				
				if(strcasecmp($type,$v['type'])!=0){
					
					db()->execute($modifySql);
				}
				break;
			}
		}
	}
	
	public function execute_upgrade(){
		$mconfig=model('admin/Config');
		$dbVersion=$mconfig->getVersion();
		$fileVersion=$this->get_skycaiji_version();
		
		if(empty($dbVersion)){
			return array('success'=>false,'msg'=>'未获取到数据库中的版本号');
		}
		if(empty($fileVersion)){
			return array('success'=>false,'msg'=>'未获取到项目文件的版本号');
		}
		
		if(version_compare($dbVersion,$fileVersion)>=0){
			
			return array('success'=>true,'msg'=>'数据库已是最新版本，无需更新');
		}
		/*找出更新函数*/
		$methods=get_class_methods($this);
		$upgradeDbMethods=array();
		foreach ($methods as $method){
			if(preg_match('/^upgrade_db_to(?P<ver>(\_\d+)+)$/',$method,$toVer)){
				
				$toVer=str_replace('_', '.', trim($toVer['ver'],'_'));
				if(version_compare($toVer,$dbVersion)>=1){
					
					if(version_compare($toVer,$fileVersion)<=0){
						
						$upgradeDbMethods[$toVer]=$method;
					}
				}
			}
		}
		if(empty($upgradeDbMethods)){
			return array('success'=>true,'msg'=>'暂无更新');
		}
		ksort($upgradeDbMethods);
		foreach ($upgradeDbMethods as $newVer=>$upMethod){
			try {
				$this->$upMethod();
				
				$mconfig->setVersion($newVer);
			}catch (\Exception $ex){
				return array('success'=>false,'msg'=>$ex->getMessage());
			}
		}
		
		clear_dir(config('root_path').'/runtime');
		
		return array('success'=>true,'msg'=>'升级完毕');
	}

	public function upgrade_db_to_1_3(){
		
		$db_prefix=config('database.prefix');
		$proxy_table=$db_prefix.'proxy_ip';
		$exists=db()->query("show tables like '{$proxy_table}'");
		if(empty($exists)){
			
			$addTable=<<<EOF
CREATE TABLE `{$proxy_table}` (
  `ip` varchar(100) NOT NULL,
  `user` varchar(100) NOT NULL DEFAULT '',
  `pwd` varchar(100) NOT NULL DEFAULT '',
  `invalid` tinyint(4) NOT NULL DEFAULT '0',
  `failed` int(11) NOT NULL DEFAULT '0',
  `num` int(11) NOT NULL DEFAULT '0',
  `time` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ip`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8
EOF;
			db()->execute($addTable);
		}
	
		/*修改表*/
		
		$columns_collected=db()->query("SHOW COLUMNS FROM `{$db_prefix}collected`");
		if(!$this->check_exists_field('titleMd5', $columns_collected)){
			
			db()->execute("alter table `{$db_prefix}collected` add `titleMd5` varchar(32) NOT NULL DEFAULT ''");
		}
	
		$indexs_collected=db()->query("SHOW INDEX FROM `{$db_prefix}collected`");
		if(!$this->check_exists_index('ix_titlemd5', $indexs_collected)){
			
			db()->execute("ALTER TABLE `{$db_prefix}collected` ADD INDEX ix_titlemd5 ( `titleMd5` )");
		}
		
		$columns_task=db()->query("SHOW COLUMNS FROM `{$db_prefix}task`");
		if(!$this->check_exists_field('config', $columns_task)){
			
			db()->execute("alter table `{$db_prefix}task` add `config` mediumtext");
		}
		
		$columns_collector=db()->query("SHOW COLUMNS FROM `{$db_prefix}collector`");
		$this->modify_field_type('config', 'mediumtext', "alter table `{$db_prefix}collector` modify column `config` mediumtext", $columns_collector);
		
		$columns_release=db()->query("SHOW COLUMNS FROM `{$db_prefix}release`");
		$this->modify_field_type('config', 'mediumtext', "alter table `{$db_prefix}release` modify column `config` mediumtext", $columns_release);
		
		$columns_rule=db()->query("SHOW COLUMNS FROM `{$db_prefix}rule`");
		$this->modify_field_type('config', 'mediumtext', "alter table `{$db_prefix}rule` modify column `config` mediumtext", $columns_rule);
	}
}
?>